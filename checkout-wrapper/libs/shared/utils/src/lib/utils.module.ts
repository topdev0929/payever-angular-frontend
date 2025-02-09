import {
  CurrencyPipe,
  DecimalPipe,
  PercentPipe,
} from '@angular/common';
import { NgModule } from '@angular/core';

import { CurrencySymbolPipe, PeCurrencyPipe } from './pipes';
import { AddressMapperService } from './services';

@NgModule({
  declarations: [
    CurrencySymbolPipe,
    PeCurrencyPipe,
  ],
  exports: [
    CurrencySymbolPipe,
    PeCurrencyPipe,
  ],
  providers: [
    CurrencyPipe,
    DecimalPipe,
    PercentPipe,
    PeCurrencyPipe,
    CurrencySymbolPipe,
    AddressMapperService,
  ],
})
export class UtilsModule {}
