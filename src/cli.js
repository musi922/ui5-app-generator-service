#!/usr/bin/env node

/**
 * MOYOTECH APP GENERATOR
 * Supports both Local and Remote (Client-Server) generation.
 */

import path from 'path';
import fs from 'fs-extra';

async function main() {
    const args = process.argv.slice(2);

    const helpMessage = `
Moyotech App Generator CLI

Usage:
  moyotech-app-generator <project-name> [options]

Remote Options (Recommended for Clients):
  --server <url>       URL of the remote generator server
  --key <key>          API Key for the remote server
  --title <title>      Application title
  --namespace <ns>     Project namespace (default: com.moyo.demo)

Local Options (For Developers):
  --scope <scope>      Project scope: ui5, cap, or both (default: both)
  --odata <bool>       Enable OData support (default: true)
  --author <name>      Author name
  --email <email>      Author email

Example Remote:
  moyotech-app-generator MyProject --server https://api.moyo.com --key secret-123
    `;

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(helpMessage);
        process.exit(0);
    }

    const projectName = args[0];
    const options = {
        projectName,
        namespace: 'com.moyo.demo',
        projectScope: 'both',
        enableOdata: true,
        applicationTitle: projectName,
        authorName: 'User',
        authorEmail: 'user@example.com',
        ciCdProvider: null,
        serverUrl: null,
        apiKey: null
    };

    // Argument parsing
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--namespace') options.namespace = args[++i];
        if (args[i] === '--scope') options.projectScope = args[++i];
        if (args[i] === '--odata') options.enableOdata = args[++i] === 'true';
        if (args[i] === '--title') options.applicationTitle = args[++i];
        if (args[i] === '--author') options.authorName = args[++i];
        if (args[i] === '--email') options.authorEmail = args[++i];
        if (args[i] === '--cicd') options.ciCdProvider = args[++i];
        if (args[i] === '--server') options.serverUrl = args[++i];
        if (args[i] === '--key') options.apiKey = args[++i];
    }

    if (options.serverUrl) {
        await runRemoteScaffold(projectName, options);
    } else {
        await runLocalScaffold(projectName, options);
    }
}

async function runLocalScaffold(projectName, options) {
    // Dynamic import so this file can stay standalone for remote users!
    try {
        const { buildContext, scaffoldFileStructure, setupCiCd, initGitRepo } = await import('./services/scaffoldService.js');

        const targetDir = path.resolve(projectName);
        const context = buildContext(options);
        const jobId = 'cli-local';

        console.log(`\n🚀 Initialising local generation for ${projectName}...`);
        await fs.ensureDir(targetDir);

        const fileCount = await scaffoldFileStructure(targetDir, context, jobId, null);
        console.log(`✅ Project structure created (${fileCount} files)`);

        await setupCiCd(targetDir, context, options.ciCdProvider, jobId, null);
        await initGitRepo(targetDir, options, jobId);

        console.log(`\n🎉 Success! Your project is ready at: ${targetDir}\n`);
    } catch (err) {
        console.error(`\n❌ Local generation failed. If you are a client, please use --server option.\n`);
        console.error(`Reason: ${err.message}`);
        process.exit(1);
    }
}

async function runRemoteScaffold(projectName, options) {
    const { serverUrl, apiKey, ...payload } = options;
    const cleanUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;

    // Clean payload for remote server
    const remotePayload = {
        projectName: payload.projectName,
        namespace: payload.namespace,
        applicationTitle: payload.applicationTitle,
        projectScope: payload.projectScope,
        authorName: payload.authorName,
        authorEmail: payload.authorEmail
    };

    try {
        console.log(`\n🚀 Requesting remote generation from ${cleanUrl}...`);

        const response = await fetch(`${cleanUrl}/api/scaffold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify(remotePayload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Server error: ${response.status}`);
        }

        const { jobId, pollUrl } = await response.json();
        const fullPollUrl = pollUrl.startsWith('http') ? pollUrl : `${cleanUrl}${pollUrl}`;

        console.log(`⏳ Generation in progress (ID: ${jobId})...`);

        let jobResult = null;
        while (true) {
            const pollResponse = await fetch(fullPollUrl, {
                headers: { 'x-api-key': apiKey || '' }
            });
            const job = await pollResponse.json();

            if (job.status === 'success') {
                jobResult = job.result;
                break;
            } else if (job.status === 'failed') {
                throw new Error(job.error || 'Generation failed on server');
            }

            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`✅ Project generated! Downloading ${jobResult.files} files...`);

        const targetDir = path.resolve(projectName);
        await fs.ensureDir(targetDir);

        for (const [relPath, content] of Object.entries(jobResult.fileMap)) {
            const absolute = path.join(targetDir, relPath);
            await fs.ensureDir(path.dirname(absolute));
            await fs.writeFile(absolute, content, 'utf8');
        }

        console.log(`\n🎉 Success! Your project is ready at: ${targetDir}\n`);

    } catch (err) {
        console.error(`\n❌ Remote generation failed: ${err.message}\n`);
        process.exit(1);
    }
}

main();
