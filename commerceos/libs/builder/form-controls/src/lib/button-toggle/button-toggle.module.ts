import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebButtonToggleGroupComponent } from './button-toggle-group.component';
import { PebButtonToggleComponent } from './button-toggle.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  declarations: [
    PebButtonToggleComponent,
    PebButtonToggleGroupComponent,
  ],
  exports: [
    PebButtonToggleComponent,
    PebButtonToggleGroupComponent,
  ],
})
export class PebButtonToggleModule {
}
