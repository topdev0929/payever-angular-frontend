import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

import { UtilsModule } from '@pe/checkout/utils';

import {
  ChooseRateComponent,
  ChooseRateAccordionComponent,
  RatesContainerComponent,
  SantanderDeSelectedRateDetailsComponent,
  KitRateViewComponent,
  KitChooseRateAccordionComponent,
  KitChooseRateComponent,
  KitChooseRateStylesComponent,
} from './components';
import { RateUtilsService } from './services';

@NgModule({
  declarations: [
    RatesContainerComponent,
    ChooseRateComponent,
    ChooseRateAccordionComponent,
    SantanderDeSelectedRateDetailsComponent,
    KitRateViewComponent,
    KitChooseRateAccordionComponent,
    KitChooseRateComponent,
    KitChooseRateStylesComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    OverlayModule,
  ],
  exports: [
    RatesContainerComponent,
    ChooseRateComponent,
    ChooseRateAccordionComponent,
    SantanderDeSelectedRateDetailsComponent,
  ],
  providers: [
    RateUtilsService,
  ],
})
export class RatesModule {
}
