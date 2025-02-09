import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FinishModule } from '@pe/checkout/finish';

import {
  FinishComponent,
} from './components';

@NgModule({
  declarations: [
    FinishComponent,
  ],
  imports: [
    CommonModule,
    FinishModule,
  ],
  exports: [

    FinishComponent,
  ],
})
export class SharedModule {
}
