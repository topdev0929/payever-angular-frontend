import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';
import { PebExpandablePanelModule, PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule, PebButtonModule } from '@pe/ui';

import { PeSettingsPersonalDomainComponent } from './personal-domain.component';


@NgModule({
  imports: [
    CommonModule,
    I18nModule.forRoot(),
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebMessagesModule,
    PebExpandablePanelModule,
    PebButtonModule,
  ],
  declarations: [
    PeSettingsPersonalDomainComponent,
  ],
  exports: [
    PeSettingsPersonalDomainComponent,
  ],
})
export class PeSettingsPersonalDomainModule {
}
