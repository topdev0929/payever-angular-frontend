import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FinishModule as SdkFinishModule } from '@pe/checkout/finish';
import { UtilsModule } from '@pe/checkout/utils';

import { FinishComponent } from './components';

@NgModule({
  declarations: [
    FinishComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    SdkFinishModule,
  ],
  exports: [
    FinishComponent,
  ],
})
export class SharedModule {}
