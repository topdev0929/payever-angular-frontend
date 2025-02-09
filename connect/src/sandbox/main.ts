import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', async () => {
  const env = await fetch('env.json').then(r => r.json());

  platformBrowserDynamic([
    {
      provide: 'CNF_ENV',
      useValue: env,
    },
  ])
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
});
