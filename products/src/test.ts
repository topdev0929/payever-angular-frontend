// This file is required by karma.conf.js and loads recursively all the .spec and framework files
/* tslint:disable:ordered-imports */
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Then we find all the tests.
// const context: any = require.context('./', true, /\.spec\.ts$/);

// all ts files except main.ts (as they call to platformBrowserDynamic)
const appsContext: any = require.context('./apps', true, /^((?!main\.ts).)*\.ts$/);
const modulesContext: any = require.context('./modules', true, /^((?!main\.ts).)*\.ts$/);

// And load the modules.
appsContext.keys().map(appsContext);
modulesContext.keys().map(modulesContext);
