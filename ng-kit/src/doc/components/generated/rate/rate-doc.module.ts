import { NgModule } from '@angular/core';

import { RateDocComponent } from './rate-doc.component';
import { RateSimpleDocComponent } from './rate-simple-doc.component';
import { RateLoadingDocComponent } from './rate-loading-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { RateModule } from '../../../../kit/rate';

import { ChooseRateExampleDocComponent, ChooseRateAccordionExampleComponent, ChooseSingleRateExampleDocComponent } from './examples';
import { ChooseRateDocComponent } from './choose-rate-doc.component';
import { ChooseRateAccordionDocComponent } from './choose-rate-accordion-doc.component';

@NgModule({
  imports: [
    DocComponentSharedModule,
    RateModule
  ],
  declarations: [
    ChooseRateExampleDocComponent,
    ChooseRateAccordionExampleComponent,
    ChooseSingleRateExampleDocComponent,
    ChooseRateDocComponent,
    ChooseRateAccordionDocComponent,
    RateDocComponent,
    RateSimpleDocComponent,
    RateLoadingDocComponent
  ]
})
export class RateDocModule {
}
