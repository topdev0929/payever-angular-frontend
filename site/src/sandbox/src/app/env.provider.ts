import { APP_INITIALIZER, InjectionToken, Provider } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';

export const COS_ENV = new InjectionToken<{
  backend: {
    builderShop: string;
    builderMedia: string;
    builderGenerator: string;
    media: string;
    studio: string;
  };
  custom: {
    storage: string;
    cdn: string;
    translation: string;
  },
  primary: {
    shopHost: string;
  }
}>('COS_ENV');

export const CosEnvProvider: Provider = {
  provide: COS_ENV,
  useValue: {},
};

/** Use HttpBackend as it doesn't wakeup Interceptors */
export const CosEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpBackend, COS_ENV],
  multi: true,
  useFactory: function initEnv(httpBackend, env) {
    const client = new HttpClient(httpBackend);
    return () => client.get('/env.json')
      .toPromise()
      .then((result) => Object.assign(env, result));
  },
};
