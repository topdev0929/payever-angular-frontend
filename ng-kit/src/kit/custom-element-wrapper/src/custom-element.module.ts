import { NgModule } from '@angular/core';

import { I18nModule } from '../../i18n';
import { EnvironmentConfigModule } from '../../environment-config';

@NgModule({
  imports: [
    I18nModule,
    EnvironmentConfigModule
  ],
  exports: [
    I18nModule,
    EnvironmentConfigModule
  ]
})
export class CustomElementModule {
}
