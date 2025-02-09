import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

import { CheckoutUiButtonModule } from '@pe/checkout/ui/button';

import { LayoutModule } from '../../models';
import { KitLayoutModule } from '../../presentation';
import { CheckoutUiButtonCancelModule } from '../shared';

import { AccordionMainComponent } from './_root';
import { AccordionFooterComponent } from './footer';
import { OrderSummaryComponent } from './order-summary';
import { SelectorShowComponent } from './selector-show';

@NgModule({
  declarations: [
    AccordionMainComponent,
    AccordionFooterComponent,
    OrderSummaryComponent,
    SelectorShowComponent,
  ],
  imports: [
    CommonModule,
    CheckoutUiButtonModule,
    CheckoutUiButtonCancelModule,
    KitLayoutModule,

    MatExpansionModule,
  ],
})
export class AccordionMainModule implements LayoutModule<AccordionMainComponent> {

  resolveComponent(): Type<AccordionMainComponent> {
    return AccordionMainComponent;
  }
}
