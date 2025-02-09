import { APP_INITIALIZER, InjectionToken, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

export const CosEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpClient, COS_ENV],
  multi: true,
  useFactory: function initEnv(http: any, env: any) {
    return () => http.get('./env.json')
      .toPromise()
      .then((result: any) => {
        console.log(result);
        Object.assign(env, result);
      });
  },
};
