import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';

import { EnvironmentConfigLoaderService } from '../services';

@Injectable()
export class EnvironmentConfigGuard implements CanActivate {

  constructor(private configLoaderService: EnvironmentConfigLoaderService) {}

  canActivate(): Observable<boolean> {
    return this.configLoaderService.loadEnvironmentConfig();
  }
}
