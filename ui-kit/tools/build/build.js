const sourceJson = require('./source');
const path = require('path');
const sass = require('node-sass');
const fs = require('fs');
const shell = require('shelljs');
const md5 = require('md5');
const sassTildaImporter = require('./sass-tilde-importer');

const hashTableFileName = 'css-hash-table.json';

processFiles();

function compileSassFile(source, destination) {
  console.log(`Compiling file ${source}`);

  const result = sass.renderSync({
    file: source,
    importer: sassTildaImporter,
    outputStyle: 'compressed'
  });

  fs.writeFileSync(destination, result.css, {encoding: 'utf8'});

  console.log(`${destination} file compiled`);
}

function processFiles() {
  const destinationDirectory = sourceJson.destinationFolder;
  if (!fs.existsSync(destinationDirectory)) {
    shell.mkdir('-p', destinationDirectory);
  }

  for (let i = 0; i < sourceJson.stylesheets.length; i++) {
    const stylesheet = sourceJson.stylesheets[i];
    const sourcePath = path.join(sourceJson.sourceFolder, stylesheet.source);
    const destPath = path.join(sourceJson.destinationFolder, stylesheet.destination);

    compileSassFile(sourcePath, destPath);
  }

  generateHashTable();
}

function generateHashTable() {
  const hashTable = {};
  for (let i = 0; i < sourceJson.stylesheets.length; i++) {
    const stylesheet = sourceJson.stylesheets[i];

    const propName = path.parse(stylesheet.destination).name;

    hashTable[propName] = calculateHash(path.join(sourceJson.destinationFolder, stylesheet.destination));
  }
  fs.writeFileSync(path.join(sourceJson.destinationFolder, hashTableFileName), JSON.stringify(hashTable), {encoding: 'utf8'});
}

function calculateHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return md5(buffer);
}

