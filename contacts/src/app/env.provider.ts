import { APP_INITIALIZER, InjectionToken, Provider } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';

import { PE_ENV } from '@pe/common';
import { EnvironmentConfigInterface } from '@pe/common/environment-config/interfaces/environment-config.interface';

export const COS_ENV: InjectionToken<EnvironmentConfigInterface> = new InjectionToken<EnvironmentConfigInterface>('COS_ENV');

export const PeEnvProvider: Provider = {
  provide: PE_ENV,
  useValue: {},
};

/** Use HttpBackend as it doesn't wakeup Interceptors */
export const PeEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpBackend, PE_ENV],
  multi: true,
  useFactory: (httpBackend, env: EnvironmentConfigInterface) => {
    const client = new HttpClient(httpBackend);
    return () => client.get('/env.json')
      .toPromise()
      .then((result: EnvironmentConfigInterface) => Object.assign(env, result))
      .catch(() => console.warn('env.json is missing in src/'));
  },
};
