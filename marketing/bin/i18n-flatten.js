const yargs = require('yargs');
const argv = yargs.argv;
const isProd = argv._[0] == 'prod';

const fs = require('fs');
const flatten = require('flat');

const marketing = JSON.parse(fs.readFileSync('assets/locale/app.json', 'utf8'));
const resultMarketing = JSON.stringify(flatten(marketing));

const ngkit = JSON.parse(fs.readFileSync('node_modules/@pe/ng-kit/assets/locale/ng-kit.json', 'utf8'));
const resultNgkit = JSON.stringify(flatten(ngkit));

let path = [];
if (isProd) {
    path.push('dist/i18n/en/marketing-app.json');
    path.push('dist/i18n/en/ng-kit-ng-kit.json');
} else {
    path.push('i18n-serve/en/marketing-app.json');
    path.push('i18n-serve/en/ng-kit-ng-kit.json');
}
fs.writeFileSync(path[0], resultMarketing);
fs.writeFileSync(path[1], resultNgkit);
