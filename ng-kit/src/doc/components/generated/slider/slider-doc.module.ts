import { NgModule } from '@angular/core';

import { FormComponentsSliderModule } from '../../../../kit/form-components/slider';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { SliderDefaultExampleDocComponent } from './examples';
import { SliderDocComponent } from './slider-doc.component';

@NgModule({
  imports: [
    DocComponentSharedModule,
    FormComponentsSliderModule
  ],
  declarations: [
    SliderDocComponent,
    SliderDefaultExampleDocComponent
  ]
})
export class SliderDocModule {
}
