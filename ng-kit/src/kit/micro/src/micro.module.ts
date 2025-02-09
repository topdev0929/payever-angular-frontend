import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule as AngularCommonModule } from '@angular/common';

import { CommonModule } from '../../common';
import { DialogModule } from '../../dialog';
import { WindowModule } from '../../window';
import { BackendLoggerModule } from '../../backend-logger';
import { LoadMicroComponent, MicroAddonComponent, SubmicroContainerComponent } from './components';
import { AppSetUpService, MessageBusService, MicroLoaderService, MicroRegistryService } from './services';
import { MicroLoaderGuard, MicroRegistryLoaderGuard } from './guards';

export interface MicroModuleConfig {
  urlMap: {[key: string]: string};
}

@NgModule({
  imports: [
    CommonModule,
    WindowModule,
    BackendLoggerModule,
    AngularCommonModule
  ],
  declarations: [
    LoadMicroComponent,
    MicroAddonComponent,
    SubmicroContainerComponent
  ],
  exports: [
    LoadMicroComponent,
    MicroAddonComponent,
    SubmicroContainerComponent
  ],
  providers: [
  ],
  entryComponents: [
  ]
})
export class MicroModule {
  static forRoot(config?: MicroModuleConfig): ModuleWithProviders<MicroModule> {
    return {
      ngModule: MicroModule,
      providers: [
        AppSetUpService,
        MessageBusService,
        MicroLoaderGuard,
        MicroRegistryLoaderGuard,
        MicroLoaderService,
        MicroRegistryService,
      ],
    };
  }
}
