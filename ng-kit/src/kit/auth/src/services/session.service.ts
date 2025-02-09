import { Injectable } from '@angular/core';
import { throttle } from 'lodash-es';

import { AuthService } from './auth.service';
import { EnvironmentConfigService } from '../../../environment-config';

@Injectable()
export class SessionService {
  private sessionTimeoutMinutes: number = 15;
  private activityEventTypes: string[] = ['keydown', 'click'];
  private activityTimeoutHandle: any = null;

  constructor(
    private authService: AuthService,
    private configService: EnvironmentConfigService,
  ) {
  }

  public startUserInactivityDetection(): void {
    this.activityEventTypes.forEach(eventType => {
      document.documentElement.addEventListener(eventType, throttle(() => this.activityDetected(), 5000));
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
    if (!this.configService.isDev()) {
      this.authService.logout().subscribe();
    }
  }
}
