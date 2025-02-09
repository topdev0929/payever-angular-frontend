import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { PlatformService } from '@pe/ng-kit/modules/common';

@Injectable({ providedIn: 'root' })
export class AppLoadedResolver implements Resolve<void> {
  constructor(private platformService: PlatformService) {}

  resolve(): void {
    // tells to dashboard that app is loaded
    this.platformService.microLoaded = true;
    this.platformService.microAppReady = 'builder';
  }
}
