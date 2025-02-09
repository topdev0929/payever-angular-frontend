import { Injectable } from '@angular/core';

import { PebBrowserConfig } from '@pe/builder/core';

import { PebSsrStateService } from './ssr-state.service';

@Injectable({ providedIn: 'root' })
export class PebClientConfigService {
  constructor(
    private readonly ssrStateService: PebSsrStateService,
  ) {
  }

  get config(): PebBrowserConfig {
    const data = this.ssrStateService.getAppData()?.config;
    if (!data) {
      throw new Error('config not set');
    }

    return data;
  }
}