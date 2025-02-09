import { isDevMode } from '@angular/core';

import { deepMapKeys } from '@pe/checkout/utils/prepare-data';

import { environment } from '../.../../../../../../../../apps/environments/environment';


export const peEnvFixture = (checkDevMode = false) => {
  const apis = environment.apis;

  return deepMapKeys(apis, (v: unknown) => {
    if (typeof v === 'string' || v instanceof String) {
      return v.replace(
        'https://checkout.test.devpayever.com',
        checkDevMode && isDevMode()
          ? 'http://localhost:8090'
          : 'https://fake-sub-domain.devpayever.com');
    }

    return v;
  });
};
