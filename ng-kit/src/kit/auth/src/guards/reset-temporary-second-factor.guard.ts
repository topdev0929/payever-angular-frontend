import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../services';

@Injectable()
export class ResetTemporarySecondFactorGuard implements CanActivate, CanDeactivate<any> {
  constructor(private authService: AuthService) { }

  canActivate(): Observable<boolean> | boolean {
    if (this.authService.isSecondFactorAuthPassedAsTemporary() &&
      !(this.authService.isSecondFactorJustPassed() && this.authService.isSecondFactorAuthPassed())) {
        return this.authService.resetTemporarySecondFactor().pipe(map(() => true));
    }
    return true;
  }

  canDeactivate(): Observable<boolean> | boolean {
    return this.canActivate();
  }
}
