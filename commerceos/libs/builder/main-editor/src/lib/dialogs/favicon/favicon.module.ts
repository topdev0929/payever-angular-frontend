import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { I18nModule } from '@pe/i18n';
import { PebFormFieldInputModule, PebFormFieldTextareaModule, PebSelectModule } from '@pe/ui';

import { LogoAndStatusPickerComponent } from './favicon-picker/favicon-picker.component';
import { PebEditorFaviconDialog } from './favicon.dialog';


@NgModule({
  declarations: [PebEditorFaviconDialog, LogoAndStatusPickerComponent],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebFormFieldTextareaModule,
    ReactiveFormsModule,
    I18nModule,
  ],
  exports: [PebEditorFaviconDialog],
})
export class PebEditorFaviconDialogModule { }
