import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';

import { I18nModule } from '@pe/i18n';
import { PETextEditorModule } from '@pe/text-editor';
import {
  PebButtonToggleModule,
  PebColorPickerFormModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSelectModule,
  PeInputPickerModule,
  PePickerModule,
} from '@pe/ui';

import { ImagesUploaderService } from '../services/images-uploader.service';

import { EditPoliciesComponent } from './edit-policies/edit-policies.component';
import { EditSecurityQuestionComponent, EditSecurityQuestionStylesComponent } from './edit-security-question';
import { EditShippingStylesComponent } from './edit-shipping/edit-shipping-styles.component';
import { EditShippingComponent } from './edit-shipping/edit-shipping.component';
import { EditStyleComponent } from './edit-style/edit-style.component';

@NgModule({
  declarations: [
    EditPoliciesComponent,
    EditSecurityQuestionComponent,
    EditSecurityQuestionStylesComponent,
    EditShippingComponent,
    EditShippingStylesComponent,
    EditStyleComponent,
  ],
  imports: [
    PebFormFieldTextareaModule,
    PebFormBackgroundModule,
    I18nModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    PebSelectModule,
    PebButtonToggleModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    MatGoogleMapsAutocompleteModule,
    PebColorPickerFormModule,
    PebLogoPickerModule,
    PePickerModule,
    PeInputPickerModule,
    PETextEditorModule,
    ClipboardModule,
  ],
  providers: [
    ImagesUploaderService,
  ],
  exports: [
  ],
})
export class ComponentModule {}
