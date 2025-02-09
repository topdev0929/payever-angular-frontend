import { ApplicationRef, enableProdMode, NgModuleRef } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from '../../environments/environment';

import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then((module: NgModuleRef<any>) => {
    enableDebugTools(module.injector.get(ApplicationRef).components[0]);
  })
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
