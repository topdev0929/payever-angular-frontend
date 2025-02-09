import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { I18nModule } from '../../i18n';

import { ChooseRateComponent, ChooseRateAccordionComponent, RateComponent, RateLoadingComponent, RateSimpleComponent, RateViewComponent } from './components';

@NgModule({
  imports: [
    CommonModule,

    MatExpansionModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSelectModule,

    I18nModule.forChild()
  ],
  declarations: [
    ChooseRateComponent,
    ChooseRateAccordionComponent,
    RateViewComponent,
    RateComponent,
    RateLoadingComponent,
    RateSimpleComponent
  ],
  exports: [
    ChooseRateComponent,
    ChooseRateAccordionComponent,
    RateComponent,
    RateLoadingComponent,
    RateSimpleComponent
  ]
})
export class RateModule {}
