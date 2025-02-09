import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { fromEvent } from 'rxjs';
import 'zone.js/dist/zone-patch-rxjs';

import { PlatformAppLoader } from '@pe/ng-kit/modules/app-loader';
import { environment } from '../../environments/environment';
import { AppModule } from './app/app.module';

// rxjs should be patched here since polyfills are not included when app is bundled as micro app
// it's important, that CommerceOS won't patch rxjs itself since then it will keep track of patch
// fact and won't update local rxjs module

// TODO(@dmlukichev): Create a ticket in @angular/zone.js about this edge case

if (environment.production) {
  enableProdMode();
}

fromEvent(window, 'pe-run-builder').subscribe(() => {
  const loader: PlatformAppLoader = new PlatformAppLoader('webpackJsonp');

  platformBrowserDynamic().bootstrapModule(AppModule, loader.bootstrap())
    .then(loader.startApplication)
    .catch(err => console.error(err));
});

if (!environment.production) {
  window.dispatchEvent(new CustomEvent('pe-run-builder', {}));
}
