const Semver = require('semver');
const fs = require('fs');
const dateFormat = require('dateformat');

const packageJson = require('../package.json');
const packageLockJson = require('../package-lock.json');
const increaseKey = process.argv[2];

if (increaseKey) {
  const nextVersion = new Semver(packageJson.version).inc(increaseKey);

  updateVersion(nextVersion);
}

function updateVersion (nextVersion) {
  replacePackageJson(nextVersion);
  replacePackageLockJson(nextVersion);
  replaceReadmeMd(nextVersion);
}

function replacePackageJson (version) {
  packageJson.version = version.format();
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\n');
}

function replacePackageLockJson (version) {
  packageLockJson.version = version.format();
  fs.writeFileSync('./package-lock.json', JSON.stringify(packageLockJson, null, 2) + '\n');
}

function replaceReadmeMd (version) {
  let firstStringTemplate = '# Version $version$ from $date$';
  let file = fs.readFileSync('./README.md', 'utf8');

  const indexOfNewline = file.indexOf('\n');
  file = file.substr(indexOfNewline);

  firstStringTemplate = firstStringTemplate.replace('$version$', version.format());
  const now = new Date();
  firstStringTemplate = firstStringTemplate.replace('$date$', dateFormat(now, 'dd.mm.yyyy'));
  file = firstStringTemplate + file;

  fs.writeFileSync('./README.md', file);
}

module.exports.updateVersion = updateVersion;
