import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { I18nModule } from '@pe/i18n';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebSelectModule,
} from '@pe/ui';

import { PebEditorIntegrationConnectDialog } from './integration-connect.dialog';

@NgModule({
  declarations: [PebEditorIntegrationConnectDialog],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebFormFieldTextareaModule,
    PebButtonToggleModule,
    PebFormBackgroundModule,
    ReactiveFormsModule,
    PebButtonModule,
    I18nModule,
  ],
  exports: [PebEditorIntegrationConnectDialog],
})
export class PebEditorIntegrationConnectDialogModule {}
