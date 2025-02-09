import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Type } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';

import {
  ButtonComponent,
  SantanderFactDeCustomElementComponent,
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
    SantanderFactDeCustomElementComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PaymentWidgetsSdkModule,
  ],
  exports: [
    SantanderFactDeCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class SantanderFactDeWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<SantanderFactDeCustomElementComponent> {
    return SantanderFactDeCustomElementComponent;
  }
}
