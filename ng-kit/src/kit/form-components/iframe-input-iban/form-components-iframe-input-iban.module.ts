import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { FormCoreModule } from '../../form-core/form-core.module';
import { WindowModule } from '../../window';
import { IframeInputIbanComponent, MaterialIframeInputIbanComponent } from './components';

const shared: any = [
  IframeInputIbanComponent,
  MaterialIframeInputIbanComponent
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    FormCoreModule,
    WindowModule
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
export class FormComponentsIframeInputIbanModule {}
