import { Provider } from '@angular/core';

import { PE_ENV } from '@pe/common/core';

import { environment } from './environment';

export const CosEnvProviders: Provider[] = [
  {
    provide: PE_ENV,
    useValue: environment.apis,
  },
];
