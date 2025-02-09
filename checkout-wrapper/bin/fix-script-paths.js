const fs = require('fs/promises');
const path = require('path');
const LOCALES = require('./locales.constant');

const distPaths = LOCALES.map(locale => `./dist/${locale}`);

distPaths.forEach(async (base, idx) => {
  await fixPaths(base, idx);
});

async function fixPaths(base, idx) {
  const inner = await fs.readdir(base);
  inner.forEach(async (element) => {
    const p = path.join(base, element);
    const isDir = (await fs.lstat(p)).isDirectory();

    if (!isDir) {
      addLocaleToUrl(p, idx);
    } else {
      fixPaths(p, idx);
    }
  });
}


async function addLocaleToUrl(localePath, idx) {
  const file = await fs.readFile(localePath, { encoding: 'utf-8' });
  const localizedIndexFile = file.replace(/\/wrapper\/MICRO_CHECKOUT_VERSION/g, `/wrapper/${LOCALES[idx]}/MICRO_CHECKOUT_VERSION`);
  await fs.writeFile(localePath, localizedIndexFile, { encoding: 'utf-8' });
}
