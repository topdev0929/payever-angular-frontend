import { ModuleWithProviders, NgModule } from '@angular/core';

import { EnvironmentConfigLoaderStubService, EnvironmentConfigService } from './services';

@NgModule({})
export class EnvironmentConfigStubModule {
  public static forRoot(): ModuleWithProviders<EnvironmentConfigStubModule> {
    return {
      ngModule: EnvironmentConfigStubModule,
      providers: [
        EnvironmentConfigService,
        EnvironmentConfigLoaderStubService.provide()
      ]
    }
  }
}
