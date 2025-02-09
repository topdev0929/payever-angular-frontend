import { ModuleWithProviders, NgModule } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

export const LOCAL_STORAGE_PREFIX: string = 'LOCAL_STORAGE_PREFIX';

export function localStorageFactory(prefix: string): LocalStorageService {
  return new LocalStorageService(`pe-${prefix}_`);
}

/**
 * @deprecated Need to use ngx-webstorage instead.
 */
@NgModule()
export class LocalStorageModule {
  public static provide(prefix: string = ''): ModuleWithProviders<LocalStorageModule> {
    return {
      ngModule: LocalStorageModule,
      providers: [
        {
          provide: LOCAL_STORAGE_PREFIX,
          useValue: prefix
        },
        {
          provide: LocalStorageService,
          useFactory: localStorageFactory,
          deps: [LOCAL_STORAGE_PREFIX]
        }
      ]
    };
  }
}
