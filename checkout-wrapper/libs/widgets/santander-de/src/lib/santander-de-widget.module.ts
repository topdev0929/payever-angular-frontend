import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Type } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';

import {
  ButtonComponent,
  SantanderDeCustomElementComponent,
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
    SantanderDeCustomElementComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PaymentWidgetsSdkModule,
  ],
  exports: [
    SantanderDeCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class SantanderDeWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<SantanderDeCustomElementComponent> {
    return SantanderDeCustomElementComponent;
  }
}
