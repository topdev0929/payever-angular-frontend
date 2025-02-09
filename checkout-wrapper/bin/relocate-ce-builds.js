const fs = require('fs/promises');
const path = require('path');
const LOCALES = require('./locales.constant');

const cePath = './dist/checkout-main-ce';

LOCALES.forEach(locale => {
  fs.rename(
    path.join(cePath, locale),
    path.join('./dist', locale, 'checkout-main-ce'),
  );
});
