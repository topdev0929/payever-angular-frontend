import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { UiModule } from '@pe/checkout/ui';

import { SharedModule } from '../../shared';

import {
  BankConsentStepComponent,
  InquireFormMitidSkatComponent,
  MitIdStepComponent,
  MitidStatusComponent,
  SkatIdStepComponent,
} from './components';

@NgModule({
  declarations: [
    InquireFormMitidSkatComponent,
    MitidStatusComponent,

    MitIdStepComponent,
    SkatIdStepComponent,
    BankConsentStepComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    UiModule,
  ],
})
export class InquireMitidSkatModule {
  resolveComponent(): Type<InquireFormMitidSkatComponent> {
    return InquireFormMitidSkatComponent;
  }
}
