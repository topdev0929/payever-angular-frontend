import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeDestroyService } from '@pe/common';
import {
  EntrySharedModule,
  NavigateToDashboardAfterAuthService,
} from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';

import { EntryLoginModule } from '../entry-login';

import { EmployeeLoginComponent } from './employee-login.component';


const routes: Routes = [
  {
    path: '',
    component: EmployeeLoginComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    RouterModule.forChild(routes),
    EntrySharedModule,
    EntryLoginModule,
  ],
  declarations: [
    EmployeeLoginComponent,
  ],
  providers: [
    PeDestroyService,
    NavigateToDashboardAfterAuthService,
  ],
})
export class EmployeeLoginModule {}
