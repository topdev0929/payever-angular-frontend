import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { BrowserModule } from '@pe/browser';
import { EntrySharedModule, ReCaptchaModule } from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule } from '@pe/ui';

import {
  EntryLoginModule,
  LoginAsUserLayoutComponent,
  LoginRefreshLayoutComponent,
  PePersonalLoginLayoutComponent,
  PersonalLoginComponent,
  PluginLoginLayoutComponent,
  PluginLoginModule,
  SocialReturnComponent,
} from './components';
import { LoginFormService } from './login-form.service';
import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    I18nModule.forChild(),
    ReactiveFormsModule,
    EntrySharedModule,
    BrowserModule,
    MatButtonModule,
    MediaModule,
    ReCaptchaModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    EntryLoginModule,
    PluginLoginModule,
  ],
  declarations: [
    PersonalLoginComponent,
    PluginLoginLayoutComponent,
    LoginRefreshLayoutComponent,
    LoginAsUserLayoutComponent,
    PePersonalLoginLayoutComponent,
    SocialReturnComponent,
  ],
  exports: [
    PePersonalLoginLayoutComponent,
  ],
  providers: [
    LoginFormService,
  ],
})
export class LoginModule {}
