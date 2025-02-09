const execSync = require('child_process').execSync;
const semver = require('semver');
const versionUpdater = require('./version');
const packageJson = require('../../package');

//TODO calculate version from Jira ticket
const nextVersion = new semver(packageJson.version).inc('patch');

versionUpdater.updateVersion(nextVersion);
console.log(nextVersion.format());
