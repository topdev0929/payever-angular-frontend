#!/usr/bin/env node

const fs = require('fs');
const git = require('git-rev-sync');

const VERSION_PATH = './src/environments/version.json';

const REVISION = process.env.CI_COMMIT_SHA || git.short();
const BRANCH = process.env.CI_COMMIT_REF_NAME || git.branch();

fs.writeFile(
    VERSION_PATH,
    `{"revision": "${REVISION}", "branch": "${BRANCH}"}`,
    {encoding: 'utf8'},
    function(err) {
        if (err) {
            console.error(`Unable to generate file ${VERSION_PATH}: ${err.message}`);
            process.exit(1);
        }
        console.log(`Successfully generated file ${VERSION_PATH}`);
    }
);
