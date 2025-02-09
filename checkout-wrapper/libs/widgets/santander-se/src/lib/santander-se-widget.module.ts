import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Type } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';


import {
  ButtonComponent,
  SantanderSeCustomElementComponent,
  DropdownCalculatorComponent,
  TextComponent,
  TwoFieldsCalculatorComponent,
} from './components';
import { WidgetsApiService } from './services';


@NgModule({
  declarations: [
    ButtonComponent,
    DropdownCalculatorComponent,
    TextComponent,
    TwoFieldsCalculatorComponent,
    SantanderSeCustomElementComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PaymentWidgetsSdkModule,
  ],
  exports: [
    SantanderSeCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class SantanderSeWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<SantanderSeCustomElementComponent> {
    return SantanderSeCustomElementComponent;
  }
}
