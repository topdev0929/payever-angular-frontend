import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FormCoreModule } from '../../form-core/form-core.module';
import { SlideToggleComponent } from './components';

const shared: any = [
  SlideToggleComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
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
export class FormComponentsSlideToggleModule {}
