import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PersonalFormModule } from '@pe/entry/personal-form';
import {
  EmployeeRegisterService, EntrySharedModule,
  NavigateToDashboardAfterAuthService,
} from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';
import { PebMessagesModule } from '@pe/ui';

import { EmployeeRegistrationComponent } from './employee-registration.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeRegistrationComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PebMessagesModule,
    I18nModule.forChild(),
    EntrySharedModule,
    PersonalFormModule,
  ],
  declarations: [
    EmployeeRegistrationComponent,
  ],
  providers: [
    EmployeeRegisterService,
    NavigateToDashboardAfterAuthService,
  ],
})
export class RegistrationEmployeeModule {}
