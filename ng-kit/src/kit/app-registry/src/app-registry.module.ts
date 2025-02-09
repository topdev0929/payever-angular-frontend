import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { AppRegistryService } from './services';

@NgModule({
})
export class AppRegistryModule {
  constructor(@Optional() @SkipSelf() parentModule: AppRegistryModule) {
    if (parentModule) {
      throw new Error('AppRegistryModule is already loaded. Import it in the AppModule only.');
    }
  }

  static forRoot(): ModuleWithProviders<AppRegistryModule> {
    return {
      ngModule: AppRegistryModule,
      providers: [AppRegistryService]
    };
  }
}
