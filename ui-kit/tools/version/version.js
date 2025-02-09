const semver = require('semver');
const fs = require('fs');
const dateFormat = require('dateformat');

const packageJson = require('../../package.json');
const increaseKey = process.argv[2];

if (increaseKey) {
  const nextVersion = new semver(packageJson.version).inc(increaseKey);

  updateVersion(nextVersion);
}

function updateVersion(nextVersion) {
  replacePackageJson(nextVersion);
  replaceAppComponent(nextVersion);
  replaceReadmeMd(nextVersion);
}


function replacePackageJson(version) {
  packageJson.version = version.format();
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
}

function replaceAppComponent(version) {
  const appComponentPath = './src/doc/app.component.html';
  let appComponent = fs.readFileSync(appComponentPath, 'utf8');
  const spanRegex = /\<span id=\"ui-kit-version\"\>.*\<\/span\>/g;
  const newSpan = '<span id="ui-kit-version">payever UI Kit v ' + version.format() + '</span>';

  appComponent = appComponent.replace(spanRegex, newSpan)

  fs.writeFileSync(appComponentPath, appComponent);
}

function replaceReadmeMd(version) {
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
