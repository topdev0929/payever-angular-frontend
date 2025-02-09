import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Type } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';


import {
  ButtonComponent,
  SantanderNlCustomElementComponent,
  DropdownCalculatorComponent,
  TextComponent,
  TopImageComponent,
  TwoFieldsCalculatorComponent,
} from './components';
import { WidgetsApiService } from './services';


@NgModule({
  declarations: [
    ButtonComponent,
    DropdownCalculatorComponent,
    TextComponent,
    TopImageComponent,
    TwoFieldsCalculatorComponent,
    SantanderNlCustomElementComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PaymentWidgetsSdkModule,
  ],
  exports: [
    SantanderNlCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class SantanderNlWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<SantanderNlCustomElementComponent> {
    return SantanderNlCustomElementComponent;
  }
}
