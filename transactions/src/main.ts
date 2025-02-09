import { fromEvent } from 'rxjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PlatformAppLoader } from '@pe/ng-kit/modules/app-loader';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

fromEvent(window, 'pe-run-transactions').subscribe(() => {
  const loader: PlatformAppLoader = new PlatformAppLoader();
  platformBrowserDynamic().bootstrapModule(AppModule, loader.bootstrap())
    .then(loader.startApplication)
    .catch(err => console.log(err));
});

if (!environment.production) {
  window.dispatchEvent(new CustomEvent('pe-run-transactions', {}));
}
