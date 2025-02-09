import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';
import { PebSocialSharingImageModule } from '@pe/ui';

import { PeSettingsSocialImageComponent } from './social-image.component';


@NgModule({
  imports: [
    CommonModule,
    I18nModule.forRoot(),
    PebSocialSharingImageModule,
  ],
  declarations: [
    PeSettingsSocialImageComponent,
  ],
  exports: [
    PeSettingsSocialImageComponent,
  ],
})
export class PeSettingsSocialImageModule {
}
