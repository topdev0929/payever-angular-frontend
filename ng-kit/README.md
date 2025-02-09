# Version 10.0.17 from 21.10.2020

Documentation for using https://frontend.gitlab.devpayever.com/ng-kit/

## Installation

```sh
npm install --save @pe/ng-kit
```

## How to use

* Include `pe_bootstrap.scss` and `pe_bootstrap.min.js` to project
* Be sure that font path is available in pe_fonts.scss

Don't forget to include svg sprites right after open `<body>` tag.

## How to run in dev

```sh
npm start # ...and goto <http://localhost:8080/ng-kit/>
```

## How to build

* `npm run build`
* doc folder is used to serve doc dist files and it is updated with every build.

## How to run tests

```sh
npm test # for CI-friendly single-run tests
npm run test:dev # ...or this one for tests development with browser reports and file changes watching
```

Note, that we're measure tests coverage using Istanbul utility. You can see your output in `./coverage` folder

### Tests development

_Pro TipS_:

* Set path to module you are testing in `./src/doc/test.ts` and save time on tests rerun
* Enable source-maps (`npm run test:dev --source-map=true`) for tests debugging, but remember that produces long compilation time
* Check code coverage of your tests before you sent code to review

### Modules which are already covered

* AuthModule
* MicroModule
* I18nModule
* CommonModule

## How to use UI-kit Angular modules

* [address](modules/address/README.md)
* [app-container](modules/app-container/README.md)
* [bugsnag](modules/bugsnag/README.md)
* [color-picker](modules/color-picker/README.md)
* [counter](modules/counter/README.md)
* [docker-pos](modules/docker-pos/README.md)
* [docker](modules/docker/README.md)
* [text-editor](modules/text-editor/README.md)
* [form](modules/form/README.md)
* [general-dashboard](modules/general-dashboard/README.md)
* [icons-provider](modules/icons-provider/README.md)
* [layout](modules/layout/README.md)
* [location](modules/location/README.md)
* [micro](modules/micro/README.md)
* [mobile](modules/mobile/README.md)
* [modal](modules/modal/README.md)
* [notification](modules/notification/README.md)
* [notification2](modules/notification2/README.md)
* [paragraph-editor](modules/paragraph-editor/README.md)
* [price](modules/price/README.md)
* [profile](modules/profile/README.md)
* [read-more](modules/read-more/README.md)
* [search](modules/search/README.md)
* [sidebar](modules/sidebar/README.md)
* [slider](modules/slider/README.md)
* [theme-card](modules/theme-card/README.md)
* [theme-switcher](modules/theme-switcher/README.md)
* [wallpapers](modules/wallpapers/README.md)
