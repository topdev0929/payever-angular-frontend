import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { PebPipesModule } from '@pe/builder/pipes';

import { PebColorPaletteComponent } from './color-palette.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebPipesModule,
  ],
  declarations: [
    PebColorPaletteComponent,
  ],
  exports: [
    PebColorPaletteComponent,
  ],
})
export class PebColorPaletteModule {
}
