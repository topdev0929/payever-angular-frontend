import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { CheckoutUiButtonModule } from '@pe/checkout/ui/button';

import { LayoutModule } from '../../models';
import { KitLayoutModule } from '../../presentation';
import { CheckoutUiButtonCancelModule } from '../shared';

import { AccordionHeaderComponent } from './_root';
import { ButtonShareComponent } from './button-share';

@NgModule({
  declarations: [
    AccordionHeaderComponent,
    ButtonShareComponent,
  ],
  imports: [
    CommonModule,
    CheckoutUiButtonModule,
    CheckoutUiButtonCancelModule,
    KitLayoutModule,
  ],
})
export class AccordionHeaderModule implements LayoutModule<AccordionHeaderComponent> {
  resolveComponent(): Type<AccordionHeaderComponent> {
    return AccordionHeaderComponent;
  }
}
