import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { EmployeesPermissionService } from '../services';


@Injectable({ providedIn: 'any' })
export class EmployeeGuard implements CanActivate {

  constructor(
    private router: Router,
    private envService: EnvService,
    private employeesPermissionService: EmployeesPermissionService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.employeesPermissionService.checkApps(this.app(route)).pipe(
      tap(isAllowAccess => !isAllowAccess && this.redirectToDashboard()),
    );
  }

  // need when reload page with opened app
  redirectToDashboard() {
    this.router.navigate([`business/${this.envService.businessId}/info/overview`]);
  }

  app(route: ActivatedRouteSnapshot): string {
    return route.url[0].path;
  }
}
