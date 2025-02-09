#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const lodash = require('lodash');
const LOCALES = require('./locales.constant');

const distPaths = LOCALES.map(locale => path.join('./dist', locale));

(async () => {
  for (const distPath of distPaths) {
    // Make webpack bundle unique with same hash
    console.log(`Adding skeleton files directly to the index.html... (node ${process.versions.node})`);

    const contentSkeletonApiCall = await fs.readFile(path.join(distPath, 'skeleton/api-call.html'), 'utf8');
    const contentSkeletonDefault = await fs.readFile(path.join(distPath, 'skeleton/default.html'), 'utf8');

    const filePath = path.join(distPath, 'index.html');
    const content = await fs.readFile(filePath, 'utf8');
    const searchRegexp = new RegExp(lodash.escapeRegExp('<!-- PE_WRAPPER_SKELETON_FILES -->'), 'g');
    const result = content.replace(searchRegexp, contentSkeletonApiCall + contentSkeletonDefault);
    await fs.writeFile(filePath, result);
  }
})();
