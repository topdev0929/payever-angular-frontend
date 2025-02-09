import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Type } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';

import {
  ButtonComponent,
  SantanderNoCustomElementComponent,
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
    SantanderNoCustomElementComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PaymentWidgetsSdkModule,
  ],
  exports: [
    SantanderNoCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class SantanderNoWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<SantanderNoCustomElementComponent> {
    return SantanderNoCustomElementComponent;
  }
}
