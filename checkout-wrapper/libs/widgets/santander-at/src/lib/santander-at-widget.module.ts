import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Type, NgModule } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';


import {
  ButtonComponent,
  DropdownCalculatorComponent,
  SantanderAtCustomElementComponent,
  TextComponent,
  TwoFieldsCalculatorComponent,
} from './components';
import { WidgetsApiService } from './services';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,

    PaymentWidgetsSdkModule,
  ],
  declarations: [
    ButtonComponent,
    DropdownCalculatorComponent,
    TextComponent,
    TwoFieldsCalculatorComponent,
    SantanderAtCustomElementComponent,
  ],
  exports: [
    SantanderAtCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class SantanderAtWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<SantanderAtCustomElementComponent> {
    return SantanderAtCustomElementComponent;
  }
}
