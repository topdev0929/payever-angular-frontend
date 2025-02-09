#!/usr/bin/env node

const argv = require('yargs').argv;
const upload = require('bugsnag-sourcemaps').upload;
const path = require('path');
const fs = require('fs');

const packageJson = require(path.resolve('./package.json'));

const url = argv['url'];

if (!url) {
  console.error('Usage: pe-bugsnag-sourcemaps-upload --url /dist_ext/your_app_name/');
  process.exit(1);
}

const API_KEY = '37d99313585091a3f2b4768dc01f90e4';
const VERSION_PATH = './src/environments/version.json';
const DIST_DIR_PATH = './dist';

const version = require(path.resolve(VERSION_PATH));

if (fs.existsSync(DIST_DIR_PATH)) {
  fs.readdirSync(DIST_DIR_PATH).filter(function(file) {
    return file.endsWith(".js");
  }).forEach(function(file) {
    upload({
      apiKey: API_KEY,
      appVersion: `${packageJson.name} ${packageJson.version}-${version.branch}`,
      minifiedUrl: `*${url}${file}*`,
      sourceMap: path.resolve(`${DIST_DIR_PATH}/${file}.map`),
      minifiedFile: path.resolve(`${DIST_DIR_PATH}/${file}`),
      overwrite: true,
      uploadSources: true
    }, function(err) {
      if (err) {
        console.warn(file + ': Bugsnag: Sourcemap can\'t upload ' + err.message);
      }
      else {
        console.log(file + ': Bugsnag: Sourcemap was uploaded successfully.');
      }
    });
  });
}
else {
  console.warn(DIST_DIR_PATH + ': Bugsnag: Directory doesn\'t exist');
}
