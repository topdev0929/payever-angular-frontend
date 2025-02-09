import { NgModule } from '@angular/core';

import { DocComponentSharedModule } from '../doc-component-shared.module';
import { I18nModule } from '../../../../kit/i18n';

import { LocalesSwitcherExampleDocComponent } from './examples';
import { I18nDocComponent } from './i18n-doc.component';

@NgModule({
  imports: [
    DocComponentSharedModule,
    I18nModule
  ],
  declarations: [
    I18nDocComponent,
    LocalesSwitcherExampleDocComponent
  ]
})
export class I18nDocModule {}
