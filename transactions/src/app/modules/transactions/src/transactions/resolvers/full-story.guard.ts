import { Injectable } from '@angular/core';
import {
  CanActivate
} from '@angular/router';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { FullStoryService } from '@pe/ng-kit/modules/full-story';

@Injectable()
export class FullStoryGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private fullStoryService: FullStoryService
  ) { }

  canActivate(): boolean {
    const email: string = this.authService.getUserData() ? this.authService.getUserData().email : null;
    this.fullStoryService.init();
    this.fullStoryService.identify(email);
    return true;
  }
}
