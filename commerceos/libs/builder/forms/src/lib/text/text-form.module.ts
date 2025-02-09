import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { PebAutoHideScrollbarModule } from '@pe/builder/editor-utils';
import { PebButtonToggleModule, PebNumberInputModule } from '@pe/builder/form-controls';
import { I18nModule } from '@pe/i18n';

import { PebFontListComponent } from './font-list.component';
import { PebTextFormComponent } from './text-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    ScrollingModule,
    PebButtonToggleModule,
    PebNumberInputModule,
    PebAutoHideScrollbarModule,
    I18nModule,
  ],
  declarations: [
    PebTextFormComponent,
    PebFontListComponent,
  ],
  exports: [
    PebTextFormComponent,
  ],
})
export class PebTextFormModule {
}
