import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { I18nModule } from '@pe/i18n';
import { PebFormBackgroundModule, PebFormFieldInputModule } from '@pe/ui';

import { PeSettingsPayeverDomainComponent } from './payever-domain.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    I18nModule.forRoot(),
    PebFormFieldInputModule,
    PebFormBackgroundModule,
  ],
  declarations: [
    PeSettingsPayeverDomainComponent,
  ],
  exports: [
    PeSettingsPayeverDomainComponent,
  ],
})
export class PeSettingsPayeverDomainModule {
}
