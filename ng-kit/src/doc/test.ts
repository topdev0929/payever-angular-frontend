// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Then we find all the tests.
// WARNING: DO NOT REMOVE 'module' from this require.context pattern - it needs for
// proper code coverage measure
const context: any = require.context('../kit', true, /\.(spec|module)\.ts$/);
// And load the modules.
context.keys().map(context);
