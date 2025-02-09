import { NgModule } from '@angular/core';

import { I18nModule } from '../../i18n/src';
import { BusinessService } from './services';

@NgModule({
  imports: [I18nModule],
  providers: [BusinessService]
})
export class BusinessModule {
}
