import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { AbbreviationPipe } from './pipes';
import { EventBusService, LoaderManagerService, PlatformService, GetRequestsCachingInterceptor } from './services';

@NgModule({
  declarations: [AbbreviationPipe],
  exports: [AbbreviationPipe]
})
export class CommonModule {
  static forRoot(): ModuleWithProviders<CommonModule> {
    return {
      ngModule: CommonModule,
      providers: [
        EventBusService,
        LoaderManagerService,
        PlatformService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: GetRequestsCachingInterceptor,
          multi: true
        }
      ]
    };
  }
}
