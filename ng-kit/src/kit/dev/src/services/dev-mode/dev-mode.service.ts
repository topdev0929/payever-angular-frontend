import { Injectable, isDevMode } from '@angular/core';

import { DevModeServiceInterface } from './dev-mode.service.interface';

/**
 * DevModeService is created only for #isDevMode()
 * method calls in real apps, and have ability to mock it
 * in tests. Because Angular does not allow to switch
 * any configured platform into production mode (and, of
 * course, back), so it's impossible to cover code branches
 * inside blocks like `if (isDevMode()) { throw new Error(); }`.
 */
@Injectable()
export class DevModeService implements DevModeServiceInterface {

  isDevMode(): boolean {
    return isDevMode();
  }

}
