import { APP_INITIALIZER, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PE_ENV } from '@pe/common';

export const PeEnvProvider: Provider = {
  provide: PE_ENV,
  useValue: {},
};

export const PeEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpClient, PE_ENV],
  multi: true,
  useFactory: function initEnv(http: any, env: any): any {
    return () => http.get('/env.json')
      .toPromise()
      .then((result: any) => {
        console.log(result);
        Object.assign(env, result);
      });
  },
};
