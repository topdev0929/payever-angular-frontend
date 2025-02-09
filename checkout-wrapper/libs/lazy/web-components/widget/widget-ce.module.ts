import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CheckoutWidgetComponent } from './checkout-widget.component';
import { WidgetSelectorComponent } from './widget-selector';

@NgModule({
  declarations: [
    CheckoutWidgetComponent,
    WidgetSelectorComponent,
  ],
  imports: [
    CommonModule,
  ],
})
export class CeWidgetModule {
  resolveComponent(): typeof CheckoutWidgetComponent {
    return CheckoutWidgetComponent;
  }
}
