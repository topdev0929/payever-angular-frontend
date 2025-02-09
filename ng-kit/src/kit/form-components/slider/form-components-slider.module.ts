import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatSliderModule } from '@angular/material/slider';

import { FormCoreModule } from '../../form-core/form-core.module';
import { SliderComponent } from './components';

const shared: any = [
  SliderComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSliderModule,
    FormCoreModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared
  ]
})
export class FormComponentsSliderModule {}
