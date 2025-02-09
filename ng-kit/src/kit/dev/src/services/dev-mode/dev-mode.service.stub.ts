import { Injectable, isDevMode, Provider } from '@angular/core';

import { DevModeServiceInterface } from './dev-mode.service.interface';
import { DevModeService } from './dev-mode.service';

/**
 * DevModeStubService is mock for DevModeService for testing purposes
 */
@Injectable()
export class DevModeStubService implements DevModeServiceInterface {

  private devMode: boolean = isDevMode();

  enableDevMode(): void {
    this.devMode = true;
  }

  enableProdMode(): void {
    this.devMode = false;
  }

  isDevMode(): boolean {
    return this.devMode;
  }

  reset(): void {
    this.enableDevMode();
  }

  static provide(): Provider {
    return {
      provide: DevModeService,
      useClass: DevModeStubService
    };
  }

}
