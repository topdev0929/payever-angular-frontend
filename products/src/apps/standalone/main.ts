import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { fromEvent } from 'rxjs';

import { environment } from '../../environments/environment';
import { AppModule } from './app/app.module';
import { PlatformAppLoader } from './platform-app-loader.class';


if (environment.production) {
  enableProdMode();
}

fromEvent(window, 'pe-run-products').subscribe(() => {
  const loader: PlatformAppLoader = new PlatformAppLoader();

  /* tslint:disable-next-line:no-console */
  platformBrowserDynamic().bootstrapModule(AppModule, {
    ...(loader.bootstrap() || {}),
    preserveWhitespaces: true,
  })
    // tslint:disable-next-line: no-unbound-method
    .then(loader.startApplication)
    // tslint:disable-next-line: no-console
    .catch(err => console.log(err));
});

if (!environment.production) {
  window.dispatchEvent(new CustomEvent('pe-run-products', {}));
}





