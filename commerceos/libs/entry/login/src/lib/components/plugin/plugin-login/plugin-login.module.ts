import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { BrowserModule } from '@pe/browser';
import { PE_ENV } from '@pe/common';
import { ReCaptchaModule } from '@pe/entry/shared';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule } from '@pe/ui';

import { LoginStyleModule } from '../../login-styles/login-style.module';

import { PluginLoginComponent } from './plugin-login.component';


(window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
  'social-facebook-12',
  'login-mail-20',
  'social-google-20',
]);

@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    ReactiveFormsModule,
    MatButtonModule,
    MediaModule,
    ReCaptchaModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    BrowserModule,
    LoginStyleModule,
  ],
  declarations: [
    PluginLoginComponent,
  ],
  exports: [
    PluginLoginComponent,
  ],
  providers: [
    {
      provide: 'GOOGLE_AUTH_CLIENT_ID',
      deps: [PE_ENV],
      useFactory: env => env.config.googleAuthClientId,
    },
  ],
})
export class PluginLoginModule { }
