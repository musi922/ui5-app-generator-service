import path from 'path';
import fs from 'fs-extra';
import Mustache from 'mustache';
import simpleGit from 'simple-git';
import { v4 as uuidv4 } from 'uuid';
import ui5Templates from '../templates/ui5Templates.js';
import capTemplates from '../templates/capTemplates.js';
import cicdTemplates from '../templates/cicdTemplates.js';
import { createJob, updateJob, pushStep, JOB_STATUS } from '../utils/jobStore.js';
import logger from '../utils/logger.js';



function buildContext(input) {
  const projectNameBase = path.basename(input.projectName);
  const appId = projectNameBase.replace(/-/g, '').toLowerCase();

  return {
    ...input,
    appId,
    projectNameBase,
    ui5ProjectName: `${input.namespace}.${appId}`.toLowerCase(),
    i18nTitle: `appTitle`,
    i18nDescription: `appDescription`,
    projectScope: input.projectScope || 'both',
    enableOdata: !!(input.projectScope === 'both' || input.projectScope === 'cap' || input.enableOdata),
    odataServiceUrl: input.odataServiceUrl || (input.projectScope === 'both' || input.projectScope === 'cap' ? '/odata/v4/main/' : ''),
    authorName: input.authorName || 'Your Name',
    authorEmail: input.authorEmail || 'dev@yourcompany.com'
  };
}

async function writeTemplateFile(targetDir, filePath, content, context, fileMap) {
  const renderedContent = Mustache.render(content, context);
  const renderedPath = Mustache.render(filePath, context);
  const absolute = path.join(targetDir, renderedPath);
  await fs.ensureDir(path.dirname(absolute));
  await fs.writeFile(absolute, renderedContent, 'utf8');
  if (fileMap) {
    fileMap[renderedPath] = renderedContent;
  }
}

async function scaffoldFileStructure(targetDir, context, jobId, fileMap) {
  pushStep(jobId, { name: 'scaffold-files', status: 'running', message: 'Writing project files' });

  const scope = context.projectScope || 'both';

  const ui5Dirs = [
    'webapp/controller',
    'webapp/view',
    'webapp/view/fragment',
    'webapp/model',
    'webapp/i18n'
  ];

  const capDirs = [
    'test/data',
    'srv',
    'srv/i18n',
    'test/restclient'
  ];

  const finalUi5Dirs = scope === 'both'
    ? ui5Dirs.map(d => `app/${d}`)
    : ui5Dirs;

  const dirsToCreate = [];
  if (scope === 'ui5' || scope === 'both') {
    dirsToCreate.push(...finalUi5Dirs);
  }
  if (scope === 'cap' || scope === 'both') {
    dirsToCreate.push(...capDirs);
  }

  for (const dir of dirsToCreate) {
    await fs.ensureDir(path.join(targetDir, dir));
  }

  let fileCount = 0;

  if (scope === 'ui5' || scope === 'both') {
    for (const [filePath, content] of Object.entries(ui5Templates)) {
      const targetFilePath = scope === 'both'
        ? `app/${filePath}`
        : filePath;

      await writeTemplateFile(targetDir, targetFilePath, content, context, fileMap);
      logger.debug(`Written UI5 file: ${targetFilePath}`, { jobId });
      fileCount++;
    }
  }

  if (scope === 'cap' || scope === 'both') {
    for (const [filePath, content] of Object.entries(capTemplates)) {
      await writeTemplateFile(targetDir, filePath, content, context, fileMap);
      logger.debug(`Written CAP file: ${filePath}`, { jobId });
      fileCount++;
    }
  }

  pushStep(jobId, { name: 'scaffold-files', status: 'done', message: `${fileCount} files written` });
  return fileCount;
}

async function setupCiCd(targetDir, context, provider, jobId, fileMap) {
  if (!provider) return;

  pushStep(jobId, { name: 'cicd', status: 'running', message: `Setting up CI/CD for ${provider}` });

  const template = cicdTemplates[provider];
  if (!template) {
    logger.warn(`No CI/CD template found for provider: ${provider}`, { jobId });
    return;
  }

  await writeTemplateFile(targetDir, template.path, template.content, context, fileMap);
  pushStep(jobId, { name: 'cicd', status: 'done', message: `${provider} pipeline written at ${template.path}` });
}

async function initGitRepo(targetDir, config, jobId) {
  pushStep(jobId, { name: 'git-init', status: 'running', message: 'Initialising git repository' });

  const git = simpleGit(targetDir);

  await git.init();
  await git.addConfig('user.name', process.env.GIT_USER_NAME || config.authorName || 'SAP Scaffold Agent');
  await git.addConfig('user.email', process.env.GIT_USER_EMAIL || config.authorEmail || 'scaffold@company.com');

  await git.add('.');
  await git.commit('chore: initial project scaffold by SAP Scaffold Agent');

  pushStep(jobId, { name: 'git-init', status: 'done', message: 'Initial commit created' });

  if (config.gitRepoUrl) {
    pushStep(jobId, { name: 'git-push', status: 'running', message: `Pushing to ${config.gitRepoUrl}` });
    try {
      await git.addRemote('origin', config.gitRepoUrl);
      await git.push('origin', 'main', ['--set-upstream']);
      pushStep(jobId, { name: 'git-push', status: 'done', message: 'Pushed to remote' });
    } catch (err) {
      logger.warn(`Git push failed: ${err.message}`, { jobId });
      pushStep(jobId, { name: 'git-push', status: 'warning', message: `Push failed: ${err.message}` });
    }
  }
}

async function runScaffold(input) {
  const jobId = uuidv4();
  const context = buildContext(input);
  const targetDir = path.resolve(input.projectName);

  createJob(jobId, {
    projectName: input.projectName,
    namespace: input.namespace,
    targetDir,
  });

  updateJob(jobId, { status: JOB_STATUS.RUNNING });

  setImmediate(async () => {
    try {
      await fs.ensureDir(targetDir);
      logger.info(`Scaffolding project at: ${targetDir}`, { jobId });

      const fileMap = {};
      const fileCount = await scaffoldFileStructure(targetDir, context, jobId, fileMap);
      await setupCiCd(targetDir, context, input.ciCdProvider, jobId, fileMap);
      await initGitRepo(targetDir, input, jobId);

      updateJob(jobId, {
        status: JOB_STATUS.SUCCESS,
        result: {
          projectPath: targetDir,
          projectName: input.projectName,
          namespace: `${input.namespace}.${context.appId}`,
          files: fileCount,
          ciCdProvider: input.ciCdProvider || null,
          gitInitialised: true,
          gitPushed: !!input.gitRepoUrl,
          fileMap,
        },
      });

      logger.info(`Scaffold complete for ${input.projectName}`, { jobId });
    } catch (err) {
      logger.error(`Scaffold failed: ${err.message}`, { jobId, stack: err.stack });
      updateJob(jobId, {
        status: JOB_STATUS.FAILED,
        error: err.message,
      });
    }
  });

  return jobId;
}

export { runScaffold, buildContext, scaffoldFileStructure, setupCiCd, initGitRepo };
