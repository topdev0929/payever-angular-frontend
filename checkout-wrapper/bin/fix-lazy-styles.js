#!/usr/bin/env node

/*
 * Fix to solve problem with adding hash to lazy css file:
 * https://github.com/angular/angular-cli/issues/11235
 * Can be removed when problem is solved in Angular CLI
 * */

const fs = require('fs/promises');
const LOCALES = require('./locales.constant');

LOCALES.forEach(async (locale) => {
  const base = `./dist/${locale}`;

  const indexFile = `${base}/index.html`;
  const final = `lazy-styles.css`;

  const distFiles = await fs.readdir(base);

  const fileName = distFiles.find(a => a.indexOf('lazy-styles.') === 0);
  if (fileName) {

    let content = await fs.readFile(indexFile, 'utf-8');
    for (let i = 0; i < 50; ++i) { // TODO Make RegExp
      content = content.replace(final, fileName);
    }

    fs.writeFile(indexFile, content, { flags: 'a' },
      err => {
        if (err) {
          console.error(`Error replacing '${fileName}' in '${indexFile}', ${err}`);
        }
        else {
          console.log(`File '${final}' was replaced to '${fileName}' inside '${indexFile}'`);
        }
      }
    );
  } else {
    console.error(`Lazy css file not found!`);
  }
});
