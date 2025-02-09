import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Type } from '@angular/core';

import { AbstractBaseWidgetModule, PaymentWidgetsSdkModule } from '@pe/checkout/payment-widgets';

import {
  ButtonComponent,
  ZiniaInstallmentsCustomElementComponent,
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
    ZiniaInstallmentsCustomElementComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PaymentWidgetsSdkModule,
  ],
  exports: [
    ZiniaInstallmentsCustomElementComponent,
  ],
  providers: [
    WidgetsApiService,
  ],
})
export class ZiniaInstallmentsWidgetModule extends AbstractBaseWidgetModule {
  resolveComponent(): Type<ZiniaInstallmentsCustomElementComponent> {
    return ZiniaInstallmentsCustomElementComponent;
  }
}
