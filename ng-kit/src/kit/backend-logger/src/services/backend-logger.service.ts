import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentConfigService } from '../../../environment-config/src/services/environment-config.service';

@Injectable()
export class BackendLoggerService {

  readonly skipForLocalHost: boolean = true;

  constructor(
    private http: HttpClient,
    private configService: EnvironmentConfigService
  ) {
  }

  logError(message: string): void {
    console.error('Critical error', message);
    if (this.configService.getConfig().custom && this.configService.getConfig().custom.integrator) {
      if (this.skipForLocalHost && window.location.hostname === 'localhost') {
        // For now do nothing
      } else {
        this.http.post(`${this.configService.getConfig().custom.integrator}/api/hook/application`, {
          type: 'error',
          url: window.location.href,
          message: message
        }).subscribe();
      }
    } else {
      console.warn('integrator in not configured in env.json');
    }
  }

}
