import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Type } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';

import {
  ButtonComponent,
  SantanderDkCustomElementComponent,
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
    SantanderDkCustomElementComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PaymentWidgetsSdkModule,
  ],
  exports: [
    SantanderDkCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class SantanderDkWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<SantanderDkCustomElementComponent> {
    return SantanderDkCustomElementComponent;
  }
}
