import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';

import { CosEnvService } from '@pe/base';
import { BusinessApiService, SettingsBusinessInterface, BusinessAccessOptionsInterface } from '@pe/business';
import { EnvService } from '@pe/common';
import { BusinessState } from '@pe/user';

import { BusinessEnvService } from '../services';

@Injectable()
export class SettingsAccessGuard implements CanActivate {
  @SelectSnapshot(BusinessState.businessData) businessData: SettingsBusinessInterface;
  @SelectSnapshot(BusinessState.businessAccessOptions) businessAccessOptions: BusinessAccessOptionsInterface;

  constructor(
    private envService: EnvService,
    private cosEnvService: CosEnvService,
    private businessEnvService: BusinessEnvService,
    private apiService: BusinessApiService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | boolean {
    const id = state.url.split('/')[2] || route.url[1]?.path;
    const innerPath = state.url.split('/')[4] || route.url[3]?.path;

    this.envService.businessData = this.businessData;
    this.envService.businessId = this.businessData._id;
    this.businessEnvService.businessAccessOptions = this.businessAccessOptions;

    if (this.cosEnvService.isPersonalMode && !innerPath) {
      this.router.navigate([`personal/${id}/settings/general/personal`]);
    }

    return this.cosEnvService.isPersonalMode || this.businessAccessOptions?.hasAccess;
  }
}
