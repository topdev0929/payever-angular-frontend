const fs = require('fs/promises');
const LOCALES = require('./locales.constant');
const path = require('path');

const [
  SOURCE,
  OUTPUT,
] = process.argv.slice(2);
const MAX_TRIES = 3;
let counter = 0;

const LOCALE_TRANSLATIONS_DIR = path.join(SOURCE, 'default');

const TRANSLATIONS_CDN_MAP = {
  test: 'https://translations.test.devpayever.com',
  staging: 'https://translations.staging.devpayever.com',
  production: 'https://translations.payever.org',
};

const HOST = process.env.MICRO_URL_TRANSLATION_CDN
    || process.env.I18N_HOST
    || TRANSLATIONS_CDN_MAP[process.env.NAMESPACE]
    || 'https://translations.staging.devpayever.com';

if (process.env.NAMESPACE) {
  console.log('TRANSLATIONS_CDN_URL=', TRANSLATIONS_CDN_MAP[process.env.NAMESPACE]);
}

function flattenObject(obj, parent, res = {}) {
  Object.entries(obj).forEach(([key, value]) => {
    const propName = parent ? `${parent}.${key}` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, propName, res);
    } else {
      res[propName] = value.replace(/{{/g, '{$').replace(/}}/g, '}').replace(/\s+(?=[^{\}]*\})/g, '');
    }
  });

  return res;
}

async function fetchFile(url, fileData) {
  return fetch(url)
    .then(async (res) => {
      const data = await res.json();
      let flatData = flattenObject(data);
      Object.assign(fileData.translations, flatData);
    })
    .catch(() => {
      if (counter < MAX_TRIES) {
        counter++;

        return fetchFile(url, fileData);
      }
    });
}

async function fetchFiles(locale) {
  const fileNames = await fs.readdir(LOCALE_TRANSLATIONS_DIR);
  const fileData = {
    locale,
    translations: {},
  };

  return new Promise(async (resolve, reject) => {
    const requests = fileNames.map(fileName => {
      const url = `${HOST}/frontend-${fileName.split('.json')[0]}-${locale}.json?${new Date().getTime()}`;

      return fetchFile(url, fileData);
    });

    try {
      await Promise.all(requests);
    } catch (err) {
      console.error('Error occured while downloading files...');
      reject(err);
    }
    resolve(fileData);
  });
}

function addLocale(locale, json) {
  return {
    ...json,
    translations: { ...json?.translations, locale  }
  };
}

(async () => {
  console.log('Initializing localization...');
  LOCALES.forEach(async (locale) => {
    const fileData = await fetchFiles(locale);

    try {
      await fs.access(OUTPUT)
    } catch {
      await fs.mkdir(OUTPUT, { recursive: true });
    }

    await fs.writeFile(
      path.join(OUTPUT, `translation-bundle-${locale}.json`),
      JSON.stringify(addLocale(locale, fileData)),
    );

    console.log(`Translations for ${locale.toUpperCase()} done!`);
  });
})();
