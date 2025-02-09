import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { PeAppEnv } from '@pe/app-env';
import { BusinessInterface } from '@pe/business';
import { EnvService } from '@pe/common';
import { BusinessState } from '@pe/user';

import { PeAffiliatesEnvService } from '../services';

@Injectable()
export class PeAffiliatesEnvGuard implements CanActivate {
    @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    @Inject(EnvService) private peAffiliatesEnvService: PeAffiliatesEnvService,
    @Inject(PeAppEnv) private peAppEnv: PeAppEnv,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.peAffiliatesEnvService.businessData = this.businessData;
    this.peAffiliatesEnvService.businessId = this.businessData._id;
    this.peAppEnv.business = this.businessData._id;
    this.peAffiliatesEnvService.businessName = this.businessData.name;

    return true;
  }
}
