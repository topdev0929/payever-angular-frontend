import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { Store } from '@ngxs/store';

import { PebClientBootstrapData, PebIntegrationApiCachedDataAddAction } from '@pe/builder/core';
import { PebIntegrationState } from '@pe/builder/integrations';

import { APP_DATA } from '../constants';

declare const pebState: any;

@Injectable({ providedIn: 'root' })
export class PebSsrStateService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    @Optional() @Inject(APP_DATA) private appData: PebClientBootstrapData,
    private store: Store,
    private transferState: TransferState,
  ) {    
    if (isPlatformBrowser(this.platformId)) {
      this.appData = pebState;
    }
  }

  getAppData(): PebClientBootstrapData | undefined {
    return this.appData;
  }

  patchAppData(update: Partial<PebClientBootstrapData>): void {
    Object.entries(update).forEach(([key, value]) => (this.appData as any)[key] = value);
  }

  transferRenderDataToSsrState() {
    if (isPlatformBrowser(this.platformId)) {
      return;
    }

    const apiCachedData = this.store.selectSnapshot(PebIntegrationState.apiCachedData);
    this.appData.apiCachedData = apiCachedData;
  }

  transferRenderDataFromSsrState() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    const cachedData = this.appData.apiCachedData ?? {};
    this.store.dispatch(new PebIntegrationApiCachedDataAddAction(cachedData));
  }
}
