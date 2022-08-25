#!/usr/bin/env node
import axios from 'axios';
import { Command } from 'commander'
import { pushAssetsRepoModuleChangesAndCreatePullRequests, regenerateTokenlists } from '@map3xyz/assets-helper';
import { ingestTokenList } from '@map3xyz/assets-helper';
import { validate } from '@map3xyz/assets-helper'
import { track } from '@map3xyz/telemetry'
var packageJson = require('./../package.json');

const program = new Command();

program
  .name('assets-cli')
  .description('CLI to automate the workflows on the map3.xyz assets repo')
  .version(packageJson.version)

program.command('validate')
  .description('Validate that the assets repository is in a valid state')
  .option('-n --network <string>', 'specific network to validate')
  .option('-r, --repo <repo>', 'The repo to validate')
  .action((options) => {
    // default
    if(options.repo === '.') {
      options.repo = process.cwd();
    }

    validate(options.network, options.repo)
      .then(result => {
        if (result.valid) {
          console.log('Repository is valid');
          process.exit(0);
        } else {
          console.log(`Repository is invalid. Errors:\n 
            ${result.errors.map(e => e.source + ': ' + e.message).join('\n')}`);
          process.exit(1);
        }
      }).catch(err => { 
          console.error("Error running validate\n", err);
          process.exit(1);
      });
});

program.command('tokenlists')
  .description('Generate or update a tokenlist.json file for base repo')
  .option('-d --directory <string>', 'repository to generate a tokenlist for')
  .action(options => {
    // default
    if(options.directory === '.') {
      options.repo = process.cwd();
    }

    regenerateTokenlists(options.directory).then(result => {
      process.exit(0);
    })
    .catch(err => {
      console.error("Error generating or updating tokenlist\n", err);
      process.exit(1);
    });
});

program.command('commit')
  .description('Push all changes to the assets repository and its submodules')
  .option('-d --directory <string>', 'repository to push changes for')
  .action(options => {
    // default
    if(options.directory === '.') {
      options.repo = process.cwd();
    }

    pushAssetsRepoModuleChangesAndCreatePullRequests(options.directory).then(result => {
      process.exit(0);
    })
    .catch(err => {
      console.error("Error committing the changes to the assets repo and/or its submodules \n", err);
      process.exit(1);
    });
});

program.command('ingest')
  .description('Ingest the following tokenlist to the assets repo')
  .option('-l --list <string>', 'file location of the new tokenlist to ingest')
  .option('-d --directory <string>', 'repository to push changes for')
  .option('-b --branch <string>', 'The name of the branch that you want to push to origin')
  .action(options => {
    // defaults 
    if(options.directory === '.') {
      options.repo = process.cwd();
    }

     if(options.list === '.') {
      options.list = process.cwd();
    }

    if(!options.list.endsWith('tokenlist.json')) {
      console.error('The tokenlist file must be a tokenlist.json one');
      process.exit(1);
    }

    ingestTokenList(options.list, options.directory, options.branch).then(result => {
      process.exit(0);
    })
    .catch(err => {
      console.error("Error ingesting the passed on tokenlist", err);
      process.exit(1);
    });
});

program.command('compile-stats')
  .description('Compile the stats for the assets repo and log them via our telemetry API')
  .action(async () => {
    try {
      const release = (await axios.get('https://api.github.com/repos/map3xyz/assets/releases/latest')).data.assets[0];
      const repo = (await axios.get('https://api.github.com/repos/map3xyz/assets')).data;
      track('github', 'oss', 'stargazers_count', undefined, repo.stargazers_count);
      track('github', 'oss', 'forks_count', undefined, repo.forks_count);
      track('github', 'oss', 'watchers_count', undefined, repo.watchers_count);
    } catch (err) {
      console.error('Error compiling stats', err);
      process.exit(1);
    }
    
    console.log('☑️ Compiled stats for assets repo');
    process.exit(0);
  })

program.parse(process.argv);
