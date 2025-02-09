import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClipboardModule } from 'ngx-clipboard';
import { RouterModule } from '@angular/router';

import { AuthModule } from '@pe/auth';
import { I18nModule } from '@pe/i18n';
import { FormModule } from '@pe/forms';
import { SnackbarModule } from '@pe/snackbar';

import { ButtonModule } from '../ngkit-modules/button';
import { NavbarModule } from '../ngkit-modules/navbar';
import { OverlayBoxModule } from '../ngkit-modules/overlay-box';

import { SharedModule } from '../shared/shared.module';
import { SantanderInstallmentModule } from './modules/santander_installment';
import { SantanderPosInstallmentModule } from './modules/santander_pos_installment';
import { SantanderCcpInstallmentModule } from './modules/santander_ccp_installment';
// import { SantanderInstallmentNoModule } from './modules/santander_installment_no';
// import { SantanderInstallmentDkModule } from './modules/santander_installment_dk';
import { SantanderInstallmentSeModule } from './modules/santander_installment_se';
import { SantanderPosInstallmentSeModule } from './modules/santander_pos_installment_se';
import { PayexCreditcardModule } from './modules/payex_creditcard';
import { PayexFakturaModule } from './modules/payex_faktura';
import { CashModule } from './modules/cash';
// import { SantanderInvoiceNoModule } from './modules/santander_invoice_no';

export const PaymentsI18nModuleForChild = I18nModule.forChild();

const modalsModules = [
  SantanderInstallmentModule,
  SantanderPosInstallmentModule,
  SantanderCcpInstallmentModule,
  // SantanderInstallmentNoModule,
  // SantanderInstallmentDkModule,
  SantanderInstallmentSeModule,
  SantanderPosInstallmentSeModule,
  // SantanderInvoiceNoModule,
  PayexCreditcardModule,
  PayexFakturaModule,
  CashModule
];

@NgModule({
  imports: [
    CommonModule,

    AuthModule,
    ClipboardModule,
    PaymentsI18nModuleForChild,
    FormModule,
    FormsModule,
    SnackbarModule,
    ButtonModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,

    NavbarModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,

    SharedModule,

    ...modalsModules
  ],
  providers: [
    FormBuilder
  ],
  exports: [
    ...modalsModules
  ]
})
export class PaymentsModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule
    };
  }
}
