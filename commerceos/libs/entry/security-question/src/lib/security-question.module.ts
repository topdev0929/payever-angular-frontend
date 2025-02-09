import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';

import { ButtonModule } from '@pe/button';
import { LoginFormService } from '@pe/entry/login';
import { EntrySharedModule, ReCaptchaModule } from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule } from '@pe/ui';
import { WindowEventsService } from '@pe/window';

import {
  LoginSecurityQuestionComponent,
  LoginSecurityQuestionStylesComponent,
} from './components';
import { SecurityQuestionGuard } from './guards';


const routes: Routes = [
  {
    path: '',
    canActivate: [SecurityQuestionGuard],
    component: LoginSecurityQuestionComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    RouterModule.forChild(routes),
    MatButtonModule,
    EntrySharedModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    ReCaptchaModule,
    PebMessagesModule,
  ],
  exports: [LoginSecurityQuestionComponent],
  declarations: [LoginSecurityQuestionComponent, LoginSecurityQuestionStylesComponent],
  providers: [
    LoginFormService,
    WindowEventsService,
  ],
})
export class SecurityQuestionModule {}
