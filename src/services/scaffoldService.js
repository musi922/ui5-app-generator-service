import path from 'path';
import fs from 'fs-extra';
import Mustache from 'mustache';
import simpleGit from 'simple-git';
import { v4 as uuidv4 } from 'uuid';
import templates from '../templates/ui5Templates.js';
import cicdTemplates from '../templates/cicdTemplates.js';
import { createJob, updateJob, pushStep, JOB_STATUS } from '../utils/jobStore.js';
import logger from '../utils/logger.js';

const WORKSPACE_BASE = process.env.WORKSPACE_BASE_PATH || '/tmp/sap-projects';

function buildContext(input) {
  const appId = input.projectName
    .split('-')
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');

  return {
    ...input,
    appId,
    i18nTitle: `appTitle`,
    i18nDescription: `appDescription`,
    odataServiceUrl: input.odataServiceUrl || '/sap/opu/odata/sap/MAIN_SRV/',
    authorName: input.authorName || 'Your Name',
    authorEmail: input.authorEmail || 'dev@yourcompany.com',
  };
}

async function writeTemplateFile(targetDir, filePath, content, context) {
  const rendered = Mustache.render(content, context);
  const absolute = path.join(targetDir, filePath);
  await fs.ensureDir(path.dirname(absolute));
  await fs.writeFile(absolute, rendered, 'utf8');
}

async function scaffoldFileStructure(targetDir, context, jobId) {
  pushStep(jobId, { name: 'scaffold-files', status: 'running', message: 'Writing project files' });

  const additionalDirs = [
    'webapp/controller',
    'webapp/view',
    'webapp/model',
    'webapp/i18n',
    'webapp/css',
    'webapp/fragment',
    'webapp/localService/mockdata',
  ];

  for (const dir of additionalDirs) {
    await fs.ensureDir(path.join(targetDir, dir));
  }

  for (const [filePath, content] of Object.entries(templates)) {
    await writeTemplateFile(targetDir, filePath, content, context);
    logger.debug(`Written: ${filePath}`, { jobId });
  }

  pushStep(jobId, { name: 'scaffold-files', status: 'done', message: `${Object.keys(templates).length} files written` });
}

async function setupCiCd(targetDir, context, provider, jobId) {
  if (!provider) return;

  pushStep(jobId, { name: 'cicd', status: 'running', message: `Setting up CI/CD for ${provider}` });

  const template = cicdTemplates[provider];
  if (!template) {
    logger.warn(`No CI/CD template found for provider: ${provider}`, { jobId });
    return;
  }

  await writeTemplateFile(targetDir, template.path, template.content, context);
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
  const targetDir = path.join(WORKSPACE_BASE, `${input.projectName}-${jobId.slice(0, 8)}`);

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

      await scaffoldFileStructure(targetDir, context, jobId);
      await setupCiCd(targetDir, context, input.ciCdProvider, jobId);
      await initGitRepo(targetDir, input, jobId);

      updateJob(jobId, {
        status: JOB_STATUS.SUCCESS,
        result: {
          projectPath: targetDir,
          projectName: input.projectName,
          namespace: `${input.namespace}.${context.appId}`,
          files: Object.keys(templates).length,
          ciCdProvider: input.ciCdProvider || null,
          gitInitialised: true,
          gitPushed: !!input.gitRepoUrl,
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

export { runScaffold };
