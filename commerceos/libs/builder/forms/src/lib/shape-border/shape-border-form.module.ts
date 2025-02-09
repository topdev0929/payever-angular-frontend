import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebNumberInputModule, PebSlideToggleModule } from '@pe/builder/form-controls';
import { PebPipesModule } from '@pe/builder/pipes';
import { I18nModule } from '@pe/i18n';

import { PebShapeBorderFormComponent } from './shape-border-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebNumberInputModule,
    MatIconModule,
    PebPipesModule,
    PebSlideToggleModule,
    I18nModule,
  ],
  declarations: [
    PebShapeBorderFormComponent,
  ],
  exports: [
    PebShapeBorderFormComponent,
  ],
})
export class PebShapeBorderModule {
}
