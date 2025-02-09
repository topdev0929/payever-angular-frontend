import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';



import { UtilsModule } from '@pe/checkout/utils';

import { OrderSummaryContainerComponent } from './components';

const shared: any = [
  OrderSummaryContainerComponent,
];

@NgModule({
  imports: [
    CommonModule,

    UtilsModule,
    // IconsProviderModule,
    // SdkStatisticsModule.forRoot(),

    // SharedModule
  ],
  declarations: [
    // OrderSummaryComponent,
    OrderSummaryContainerComponent,
  ],
  providers: [
  ],
  exports: [
    ...shared,
  ],
})
export class OrderSummaryModule {
  resolveOrderSummaryContainerComponent(): Type<OrderSummaryContainerComponent> {
    return OrderSummaryContainerComponent;
  }
}
