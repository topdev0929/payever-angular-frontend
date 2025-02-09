import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevModule } from '../dev';

import { PriceComponent } from './price.component';

@NgModule({
  imports: [
    CommonModule,
    DevModule,
  ],
  declarations: [ PriceComponent ],
  entryComponents: [ PriceComponent ],
  exports: [ PriceComponent ]
})
export class PriceModule {}
