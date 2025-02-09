#!/usr/bin/env node

// FILE DEPRECATED

try {
  const path = require('path');
  const fs = require('fs-extra');
  const createSymlink = require('create-symlink');

  const rootPath = path.resolve(__dirname, '../');
  const pathArray = rootPath.split('/').reverse();

  let iconsPath = '/node_modules/@pe/ui-kit/icons';
  if (!fs.existsSync(rootPath + iconsPath)) {
    for (const pathItem of pathArray) {
      if (pathItem === 'node_modules') {
        iconsPath = '/../../..' + iconsPath;
        if (fs.existsSync(rootPath + iconsPath)) {
          break;
        }
      }
    }
  }
  iconsPath = rootPath + iconsPath;
  console.log('Found icons at "' + iconsPath + '"');

  fs.removeSync(rootPath + '/svg-spreadsheets');
  createSymlink(
    iconsPath,
    rootPath + '/svg-spreadsheets'
  ).then(() => {
    console.log('Symlink was created for "svg-spreadsheets" at "' + rootPath + '"');
  });
}
catch (e) {
  console.error('Failed to create symlink for "svg-spreadsheets"', e);
}
