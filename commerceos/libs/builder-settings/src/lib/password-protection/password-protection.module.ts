import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { I18nModule } from '@pe/i18n';
import { PebButtonToggleModule, PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule } from '@pe/ui';

import { PeSettingsPasswordProtectionComponent } from './password-protection.component';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    I18nModule.forRoot(),
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebMessagesModule,
    PebButtonToggleModule,
  ],
  declarations: [
    PeSettingsPasswordProtectionComponent,
  ],
  exports: [
    PeSettingsPasswordProtectionComponent,
  ],
})
export class PeSettingsPasswordProtectionModule {
}
