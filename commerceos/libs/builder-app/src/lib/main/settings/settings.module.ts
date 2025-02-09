import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { I18nModule } from '@pe/i18n';
import { PeAbbreviationPipeModule } from '@pe/shared/pipes';
import { PebButtonModule, PebButtonToggleModule } from '@pe/ui';

import { PeSettingsComponent } from './settings.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PebButtonModule,
    RouterModule.forChild([{
      path: '',
      component: PeSettingsComponent,
    }]),
    I18nModule.forRoot(),
    PebButtonToggleModule,
    PeAbbreviationPipeModule,
  ],
  declarations: [
    PeSettingsComponent,
  ],
  exports: [
    PeSettingsComponent,
  ],
})
export class PeBuilderAppSettingsModule {
}
