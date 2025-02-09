import { enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { PeZoneUtils } from '../../../../../../modules/micro';
import { CustomElementsModule } from './custom-elements/custom-elements.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(CustomElementsModule, PeZoneUtils.getBootstrapModuleOptions())
  .then((module: NgModuleRef<any>) => {
    PeZoneUtils.registerBootstrapModule(module);
  })
  // tslint:disable-next-line no-console
  .catch(err => console.error(err));
