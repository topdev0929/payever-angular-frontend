import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ButtonModule } from '@pe/button';
import { PeDestroyService } from '@pe/common';
import { BusinessFormModule } from '@pe/entry/business-form';
import { PersonalFormModule } from '@pe/entry/personal-form';
import {
  EntrySharedModule,
  ReCaptchaModule,
} from '@pe/entry/shared';
import { AddressModule, FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { SnackbarModule } from '@pe/snackbar';
import {
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
} from '@pe/ui';

import {
  PersonalRegistrationComponent,
} from './components';
import { PluginOnboardingComponent } from './plugin-onboarding.component';
import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationComponent } from './registration.component';


@NgModule({
  imports: [
    CommonModule,
    PebMessagesModule,
    FormsModule,
    MediaModule,
    ReactiveFormsModule,
    I18nModule.forChild(),
    AddressModule,
    ReCaptchaModule,
    FormModule,
    RegistrationRoutingModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    ButtonModule,
    EntrySharedModule,
    BusinessFormModule,
    PersonalFormModule,
    SnackbarModule,
  ],
  declarations: [
    PersonalRegistrationComponent,
    RegistrationComponent,
    PluginOnboardingComponent,
  ],
  providers: [
    MediaUrlPipe,
    PeDestroyService,
  ],
  exports: [
    PersonalRegistrationComponent,
  ],
})
export class RegistrationModule {}
