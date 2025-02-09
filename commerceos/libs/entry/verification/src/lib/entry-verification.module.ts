import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';

import { BusinessTransferOwnershipService } from '@pe/business';
import { ButtonModule } from '@pe/button';
import { PeDestroyService } from '@pe/common';
import { EntryLoginModule, LoginFormService } from '@pe/entry/login';
import { PersonalFormModule } from '@pe/entry/personal-form';
import { EmployeeRegisterService, EntrySharedModule, ReCaptchaModule } from '@pe/entry/shared';
import { FormComponentsInputModule, FormModule } from '@pe/forms';
import { AddressModule } from '@pe/forms-core';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PebFormBackgroundModule, PebFormFieldInputModule, PebMessagesModule } from '@pe/ui';
import { WindowModule } from '@pe/window';

import { VerificationComponent, TransferOwnershipComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: VerificationComponent,
  },
  {
    path: 'owner',
    component: TransferOwnershipComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    WindowModule,
    RouterModule.forChild(routes),
    EntrySharedModule,
    I18nModule.forChild(),
    FormsModule,
    MediaModule,
    ReactiveFormsModule,
    PebMessagesModule,
    PebFormBackgroundModule,
    PebFormFieldInputModule,
    AddressModule,
    ReCaptchaModule,
    EntryLoginModule,
    FormModule,
    FormComponentsInputModule,
    ButtonModule,
    MatButtonModule,
    PersonalFormModule,
  ],
  declarations: [
    VerificationComponent,
    TransferOwnershipComponent,
  ],
  providers: [
    LoginFormService,
    PeDestroyService,
    BusinessTransferOwnershipService,
    EmployeeRegisterService,
  ],
})
export class EntryVerificationModule {}
