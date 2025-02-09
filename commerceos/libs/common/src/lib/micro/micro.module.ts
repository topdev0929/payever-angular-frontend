import { CommonModule as AngularCommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LoadMicroComponent } from './components/load-micro/load-micro.component';
import { AppSetUpService, MicroLoaderService, MicroRegistryService, WindowEventsService } from './services';

export interface MicroModuleConfig {
  urlMap: {[key: string]: string};
}

@NgModule({
  imports: [
    AngularCommonModule,
  ],
  providers: [
    AppSetUpService,
    MicroLoaderService,
    MicroRegistryService,
    WindowEventsService,
  ],
  exports: [
    LoadMicroComponent,
  ],
  declarations: [
    LoadMicroComponent,
  ],
})
export class MicroModule {
}
