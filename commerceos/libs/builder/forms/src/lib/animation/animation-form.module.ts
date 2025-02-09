import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import {
  PebItemBarModule,
  PebNumberInputModule,
  PebSelectInputModule,
  PebSizeInputModule,
  PebSlideToggleModule,
} from '@pe/builder/form-controls';
import { PebPipesModule } from '@pe/builder/pipes';
import { I18nModule } from '@pe/i18n';
import { PebButtonModule } from '@pe/ui';

import { PebAnimationFormComponent } from './animation-form.component';
import { PebAnimationsFormListComponent } from './animations-form-list.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PebButtonModule,
    PebSlideToggleModule,
    PebSelectInputModule,
    PebNumberInputModule,
    PebSizeInputModule,
    PebPipesModule,
    PebAutoHideScrollbarModule,
    MatIconModule,
    I18nModule,
    PebItemBarModule,
  ],
  declarations: [
    PebAnimationsFormListComponent,
    PebAnimationFormComponent,
  ],
  exports: [
    PebAnimationsFormListComponent,
    PebAnimationFormComponent,
  ],
})
export class PebAnimationFormModule {
}
