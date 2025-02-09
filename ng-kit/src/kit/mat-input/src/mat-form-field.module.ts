import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { PeMatFormFieldComponent } from './component/mat-form-field.component';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,

    MatSelectModule,
    MatInputModule
  ],
  declarations: [
    PeMatFormFieldComponent
  ],
  exports: [
    PeMatFormFieldComponent,

    MatSelectModule,
    MatInputModule
  ]
})
export class PeMatFormFieldModule {}
