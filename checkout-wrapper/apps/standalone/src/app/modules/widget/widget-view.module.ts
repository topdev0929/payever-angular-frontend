import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { CheckoutWidgetModule } from '../../../../../custom-elements/src/app/checkout-widget/checkout-widget.module';

import {
  WidgetViewComponent,
} from './components';
import { RoutingModule } from './routing.module';



@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
    HttpClientModule,
    CheckoutWidgetModule,
  ],
  declarations: [
    WidgetViewComponent,
  ],
})
export class WidgetViewModule {
}
