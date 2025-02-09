import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { FinanceExpressModule } from './app/standalone/finance-express.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', async () => {
  const env = await fetch('env.json').then(r => r.json());

  platformBrowserDynamic([
    {
      provide: 'FINEXP_ENV',
      useValue: env,
    },
  ])
    .bootstrapModule(FinanceExpressModule)
    .catch(err => console.error(err));
});
