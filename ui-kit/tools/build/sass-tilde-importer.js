// It's fork of https://github.com/matthewdavidson/node-sass-tilde-importer/blob/master/index.js

const path = require('path');
const findParentDir = require('find-parent-dir');

function resolve(targetUrl, source) {
  const packageRoot = findParentDir.sync(source, 'node_modules');

  if (!packageRoot) {
    return null;
  }

  const filePath = path.resolve(packageRoot, 'node_modules', targetUrl);

  return filePath;
}

module.exports = function importer (url, prev, done) {
  return (url[ 0 ] === '~') ? { file: resolve(url.substr(1), prev) } : null;
};
