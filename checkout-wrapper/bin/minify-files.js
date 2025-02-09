#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const LOCALES = require('./locales.constant');

const minify = require('minify');
const options = {
  html: {
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true
  },
  js: {
    ecma: 6,
  },
};

LOCALES.forEach(locale => {
  const distPath = path.join('./dist', locale);
  // Make webpack bundle unique with same hash
  console.log(`Minifying index.html and some assets... (node ${process.versions.node})`);

  runMinify(path.join(distPath, 'index.html'));
  runMinify(path.join(distPath, 'skeleton/api-call.html'));
  runMinify(path.join(distPath, 'skeleton/default.html'));
  runMinify(path.join(distPath, 'skeleton/loader.js'));
  runMinify(path.join(distPath, 'skeleton/styles.css'));
});

function runMinify(file) {
  minify(file, options)
    .then(async data => {
      console.log(`- Minified ${file}...`);
      fs.writeFile(file, data);
    })
    .catch(console.error);
}
