import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SantanderInstallmentModule } from './modules/santander_installment/santander_installment.module';
import { SantanderPosInstallmentModule } from './modules/santander_pos_installment/santander_pos_installment.module';
import { SantanderCcpInstallmentModule } from './modules/santander_ccp_installment/santander_ccp_installment.module';
import { SantanderInstallmentNoModule } from './modules/santander_installment_no/santander_installment_no.module';
import { SantanderInstallmentDkModule } from './modules/santander_installment_dk/santander_installment_dk.module';
import { SantanderInstallmentSeModule } from './modules/santander_installment_se/santander_installment_se.module';
import { SantanderPosInstallmentSeModule } from './modules/santander_pos_installment_se/santander_pos_installment_se.module';
import { PayexCreditcardModule } from './modules/payex_creditcard/payex_creditcard.module';
import { PayexFakturaModule } from './modules/payex_faktura/payex_faktura.module';
import { CashModule } from './modules/cash/cash.module';
import { SantanderFactoringDeModule } from './modules/santander_factoring_de/santander_factoring_de.module';
import { SantanderPosFactoringDeModule } from './modules/santander_pos_factoring_de/santander_pos_factoring_de.module';
import { SantanderInvoiceDeModule } from './modules/santander_invoice_de/santander_invoice_de.module';
import { SantanderPosInvoiceDeModule } from './modules/santander_pos_invoice_de/santander_pos_invoice_de.module';
import { SantanderInvoiceNoModule } from './modules/santander_invoice_no/santander_invoice_no.module';

// https://github.com/ng-packagr/ng-packagr/issues/1285#issuecomment-527196671
export function GetSantanderInstallmentModule() {
  return SantanderInstallmentModule;
}
export function GetSantanderPosInstallmentModule() {
  return SantanderPosInstallmentModule;
}
export function GetSantanderCcpInstallmentModule() {
  return SantanderCcpInstallmentModule;
}
export function GetSantanderInstallmentNoModule() {
  return SantanderInstallmentNoModule;
}
export function GetSantanderInstallmentDkModule() {
  return SantanderInstallmentDkModule;
}
export function GetSantanderInstallmentSeModule() {
  return SantanderInstallmentSeModule;
}
export function GetSantanderPosInstallmentSeModule() {
  return SantanderPosInstallmentSeModule;
}
export function GetPayexCreditcardModule() {
  return PayexCreditcardModule;
}
export function GetPayexFakturaModule() {
  return PayexFakturaModule;
}
export function GetCashModule() {
  return CashModule;
}
export function GetSantanderFactoringDeModule() {
  return SantanderFactoringDeModule;
}
export function GetSantanderPosFactoringDeModule() {
  return SantanderPosFactoringDeModule;
}
export function GetSantanderInvoiceDeModule() {
  return SantanderInvoiceDeModule;
}
export function GetSantanderPosInvoiceDeModule() {
  return SantanderPosInvoiceDeModule;
}
export function GetSantanderInvoiceNoModule() {
  return SantanderInvoiceNoModule;
}

// paymill CC and direct debit are not used anymore

const routes: Routes = [
  {
    path: `santander_installment`,
    loadChildren: GetSantanderInstallmentModule
  },
  {
    path: `santander_pos_installment`,
    loadChildren: GetSantanderPosInstallmentModule
  },
  {
    path: `santander_ccp_installment`,
    loadChildren: GetSantanderCcpInstallmentModule
  },
  /*
  {
    path: `santander_installment_no`,
    loadChildren: GetSantanderInstallmentNoModule
  },
  {
    path: `santander_installment_dk`,
    loadChildren: GetSantanderInstallmentDkModule
  },*/
  {
    path: `santander_installment_se`,
    loadChildren: GetSantanderInstallmentSeModule
  },
  {
    path: `santander_pos_installment_se`,
    loadChildren: GetSantanderPosInstallmentSeModule
  },
  /*
  {
    path: `paypal`,
    loadChildren: () => import('./modules/paypal/paypal.module').then(m => m.PaypalModule)
  },*/
  {
    path: `payex_creditcard`,
    loadChildren: GetPayexCreditcardModule
  },
  {
    path: `payex_faktura`,
    loadChildren: GetPayexFakturaModule
  },
  /*
  {
    path: `stripe`,
    loadChildren: './modules/stripe/stripe.module#StripeModule'
  },
  {
    path: `stripe_directdebit`,
    loadChildren: './modules/stripe_directdebit/stripe_directdebit.module#StripeDirectDebitModule'
  },
  {
    path: `sofort`,
    loadChildren: () => import('./modules/sofort/sofort.module').then(m => m.SofortModule)
  },
  {
    path: `cash`,
    loadChildren: GetCashModule
  },
  {
    path: `santander_factoring_de`,
    loadChildren: GetSantanderFactoringDeModule
  },
  {
    path: `santander_pos_factoring_de`,
    loadChildren: GetSantanderPosFactoringDeModule
  },
  {
    path: `santander_invoice_de`,
    loadChildren: GetSantanderInvoiceDeModule
  },
  {
    path: `santander_pos_invoice_de`,
    loadChildren: GetSantanderPosInvoiceDeModule
  },
  {
    path: `santander_invoice_no`,
    loadChildren: GetSantanderInvoiceNoModule
  }*/
];

export const PaymentsRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [PaymentsRouterModuleForChild],
  exports: [RouterModule]
})
export class PaymentsRoutingModule {}
