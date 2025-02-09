import { ModuleWithProviders, NgModule, PLATFORM_ID } from '@angular/core';
import { SessionStorageService } from './session-storage.service';

export const SESSION_STORAGE_PREFIX: string = 'SESSION_STORAGE_PREFIX';

export function sessionStorageFactory(prefix: string, platformId: any): SessionStorageService {
  return new SessionStorageService(`pe-${prefix}_`, platformId);
}

/**
 * @deprecated Need to use ngx-webstorage instead.
 */
@NgModule()
export class SessionStorageModule {
  public static provide(prefix: string = ''): ModuleWithProviders<SessionStorageModule> {
    return {
      ngModule: SessionStorageModule,
      providers: [
        {
          provide: SESSION_STORAGE_PREFIX,
          useValue: prefix
        },
        {
          provide: SessionStorageService,
          useFactory: sessionStorageFactory,
          deps: [SESSION_STORAGE_PREFIX, PLATFORM_ID]
        }
      ]
    };
  }
}
