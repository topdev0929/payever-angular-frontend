import { Injectable } from '@angular/core';
import { throttle } from 'lodash-es';

import { PeAuthService } from './auth.service';

@Injectable()
export class SessionService {
  private sessionTimeoutMinutes = 15;
  private activityEventTypes: string[] = ['keydown', 'click'];
  private activityTimeoutHandle: any = null;

  constructor(private authService: PeAuthService) {}

  public startUserInactivityDetection(): void {
    this.activityEventTypes.forEach((eventType) => {
      document.documentElement.addEventListener(
        eventType,
        throttle(() => this.activityDetected(), 5000),
      );
    });
  }

  private startInactivityTimer(): void {
    if (this.activityTimeoutHandle) {
      clearTimeout(this.activityTimeoutHandle);
    }
    this.activityTimeoutHandle = setTimeout(() => this.finishSession(), this.sessionTimeoutMinutes * 60 * 1000);
  }

  private activityDetected(): void {
    if (this.authService.getUserData()) {
      this.startInactivityTimer();
    }
  }

  private finishSession(): void {
    if (!this.authService.isDev()) {
      this.authService.logout().subscribe();
    }
  }
}
