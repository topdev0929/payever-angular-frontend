# Welcome

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.0.

## Development server

Run `ng serve` for a dev server. The app will automatically reload if you change any of the source files.

Copy path from CommerceOS server and open at localhost, for example:

http://localhost:8080/business/eb99c9a2-6daa-474d-8dfc-c2525af3b66a/checkout

Probably for first call you will have to remove `MicroLoaderGuard` from guards (to avoid errors).

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Debugging Finance Express at checkout app

1. Run `npm run start:finexp` in first terminal
2. Run `npm run start:with-finexp` at second terminal
3. Open checkout at `http://localhost:8082/`
