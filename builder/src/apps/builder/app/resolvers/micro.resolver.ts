import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { MicroContainerTypeEnum, PlatformService } from '@pe/ng-kit/modules/common';

@Injectable({ providedIn: 'root' })
export class MicroResolver implements Resolve<any> {

  constructor(private platformService: PlatformService) {
  }

  resolve(route: ActivatedRouteSnapshot): void {
    this.platformService.microContainerType = route.data.microContainerType;
  }
}
