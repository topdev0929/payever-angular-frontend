#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');

const rootNodeModules = path.resolve(__dirname, '../../../');

function getLocaleId(lang) {
  // @TODO waiting for backend update to switch Norsk to 'nb' by default
  const TEMP_HACK_FOR_NO_LOCALE = lang === 'no' ? 'nb' : lang;
  const localeId = lang === 'en' ? 'en-GB' : TEMP_HACK_FOR_NO_LOCALE;
  return localeId;
}

// const locales = Object.keys(require('../config/lang-list'))
//   .map(getLocaleId);
// const locales = Object.keys(require('../src/modules/checkout-wrapper-sdk/src/kit/i18n/src/lib/lang-list'))
//   .map(getLocaleId);
const locales = Object.keys(require('./lang-list'))
  .map(getLocaleId);

function cleanUpNodeCountryList(allowedLocales) {
  const allowedNodes = allowedLocales.slice(0)
    .map(locale => locale.replace('-', '_'));

  allowedNodes.push('index.js');

  const dir = path.resolve(rootNodeModules, 'node-countries-list/src/data');

  if (!fs.pathExistsSync(dir)) {
    console.log(`node-countries-list path node found: ${dir}`);
    return;
  }

  console.log(`Searching node-countries-list in: ${dir}`);
  const subs = fs.readdirSync(dir);

  subs.forEach((sub) => {
    if (allowedNodes.indexOf(sub) === -1) {
      const pathToDelete = path.resolve(dir, sub);
      console.log('Removing path:', pathToDelete);
      fs.removeSync(pathToDelete);
      if (fs.existsSync(pathToDelete)) console.error('Not possible to delete:', pathToDelete);
    }
  });
}

function cleanUpMoment(allowedLocales, subPath) {
  const allowedNodes = allowedLocales.slice(0)
    .map(locale => locale.toLowerCase() + '.js');

  const dir = path.resolve(rootNodeModules, subPath);//'moment/locale');

  if (!fs.pathExistsSync(dir)) {
    console.log(`moment path node found: ${dir}`);
    return;
  }

  console.log(`Searching moment in: ${dir}`);
  const subs = fs.readdirSync(dir);

  subs.forEach((sub) => {
    if (allowedNodes.indexOf(sub) === -1) {
      const pathToDelete = path.resolve(dir, sub);
      console.log('Removing path:', pathToDelete);
      fs.removeSync(pathToDelete);
      if (fs.existsSync(pathToDelete)) console.error('Not possible to delete:', pathToDelete);
    }
  });
}

console.log('Running localizations clean up for external libraries to avoid `hungry` webpack bundling...', locales);

cleanUpNodeCountryList(locales);
cleanUpMoment(locales, 'moment/locale');
cleanUpMoment(locales, 'moment/dist/locale');
cleanUpMoment(locales, 'moment/src/locale');

module.exports = {
  locales: locales
};
