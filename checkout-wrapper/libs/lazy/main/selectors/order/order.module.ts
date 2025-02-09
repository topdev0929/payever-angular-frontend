import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';
import { AmountEditModuleMain } from '@pe/checkout/main/selectors/amount-edit';
import { UiModule } from '@pe/checkout/ui';

import { OrderEditComponent, ShowQrComponent, ProductsEditComponent } from './components';
import { OrderComponent } from './order.component';

@NgModule({
  declarations: [
    OrderComponent,
    OrderEditComponent,
    ShowQrComponent,
    ProductsEditComponent,
  ],
  imports: [
    CommonModule,
    AmountEditModuleMain,
    UiModule,
  ],
  exports: [
    OrderComponent,
  ],
})
export class OrderModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<OrderComponent> {
    return OrderComponent;
  }
}
