import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { DetailsState } from './details';
import { TransactionActionHandler, TransactionState } from './transaction';

@NgModule({
  imports: [
    CommonModule,

    NgxsModule.forFeature([
      TransactionState,
      DetailsState,
    ]),
  ],
  exports: [
    NgxsModule,
  ],
})
export class StoreModule {
  constructor(
    private transactionActionHandler: TransactionActionHandler
  ) {}
}
