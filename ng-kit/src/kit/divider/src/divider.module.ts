import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

import { DividerComponent } from './divider.component';

@NgModule({
  imports: [
    MatDividerModule,
    CommonModule
  ],
  declarations: [
    DividerComponent
  ],
  entryComponents: [
    DividerComponent
  ],
  exports: [
    DividerComponent,
    CommonModule
  ]
})
export class DividerModule {}
