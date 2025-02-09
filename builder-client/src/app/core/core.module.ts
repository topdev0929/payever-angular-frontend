import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

import { throwIfAlreadyLoaded } from './module-import-guard';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [],
  declarations: [],
  providers: [
  ]
})
export class AppCoreModule {

  constructor(@Optional() @SkipSelf() parentModule: AppCoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }

}
