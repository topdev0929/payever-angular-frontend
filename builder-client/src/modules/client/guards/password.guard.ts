import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

import { PasswordControlService } from '../services/password-control.service';

@Injectable()
export class PasswordGuard implements CanActivate {
  constructor(
    private passwordControlService: PasswordControlService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    if (this.passwordControlService.passwordEntered$.getValue()) {
      return true;
    }

    if (this.passwordControlService.passwordEnabled || this.passwordControlService.passwordLock) {
      return false;
    }

    return true;
  }
}
