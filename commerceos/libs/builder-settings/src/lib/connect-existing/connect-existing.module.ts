import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';
import { PebExpandablePanelModule, PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule, PebButtonModule } from '@pe/ui';

import { PeSettingsConnectExistingComponent } from './connect-existing.component';


@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebExpandablePanelModule,
    PebMessagesModule,
    PebButtonModule,
    I18nModule.forRoot(),
  ],
  declarations: [
    PeSettingsConnectExistingComponent,
  ],
  exports: [
    PeSettingsConnectExistingComponent,
  ],
})
export class PeSettingsConnectExistingModule {
}
