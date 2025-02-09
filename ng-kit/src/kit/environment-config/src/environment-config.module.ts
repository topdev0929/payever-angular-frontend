import { ModuleWithProviders, NgModule } from '@angular/core';

import { EnvironmentConfigLoaderService, EnvironmentConfigService } from './services';
import { EnvironmentConfigGuard } from './guards';

@NgModule()
export class EnvironmentConfigModule {
  static forRoot(): ModuleWithProviders<EnvironmentConfigModule> {
    return {
      ngModule: EnvironmentConfigModule,
      providers: [
        EnvironmentConfigService,
        EnvironmentConfigLoaderService,
        EnvironmentConfigGuard
      ]
    };
  }
}
