import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BaseModule } from '@pe/base';
import { I18nModule } from '@pe/i18n';

import {
  ActiveBusinessComponent,
  EmployeeNotificationComponent,
  LayoutComponent,
  CosLocaleListComponent,
  CosLocalesSwitcherComponent,
  PasswordMustComponent,
  CosLocaleListStyleComponent,
} from './components';
import { CosLocalesSwitcherStyleComponent } from './components/locales-switcher/locales-switcher-style.component';
import { CountryGuard } from './guards';


const EXP = [
  CosLocaleListStyleComponent,
  ActiveBusinessComponent,
  CosLocaleListComponent,
  CosLocalesSwitcherComponent,
  LayoutComponent,
  PasswordMustComponent,
  EmployeeNotificationComponent,
  CosLocalesSwitcherStyleComponent,
];
@NgModule({
  imports: [
    CommonModule,
    BaseModule,
    I18nModule.forChild(),
  ],
  exports: [...EXP],
  declarations: [...EXP],
  providers: [
    CountryGuard,
  ],
})
export class EntrySharedModule { }
