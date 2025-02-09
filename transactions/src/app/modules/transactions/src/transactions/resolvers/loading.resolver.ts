import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { PlatformService } from '@pe/ng-kit/modules/common';

@Injectable()
export class LoadingResolver implements Resolve<void> {

  constructor(private platformService: PlatformService) {}

  resolve(): void {
    // TODO change to this.platformService.microLoaded = true after ng-kit update
    this.platformService.dispatchEvent({
      target: 'dashboard-micro-loading',
      action: 'NoLoading'
    });
  }

}
