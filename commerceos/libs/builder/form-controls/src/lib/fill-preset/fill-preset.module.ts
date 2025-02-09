import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebPipesModule } from '@pe/builder/pipes';

import { PebFillPresetComponent } from './fill-preset.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebPipesModule,
  ],
  declarations: [
    PebFillPresetComponent,
  ],
  exports: [
    PebFillPresetComponent,
  ],
})
export class PebPebFillPresetModule {
}
