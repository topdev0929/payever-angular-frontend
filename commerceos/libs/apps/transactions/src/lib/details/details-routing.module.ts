import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TransactionsDetailsComponent } from './containers';

const routes: Routes = [
  {
    path: '',
    component: TransactionsDetailsComponent,
    children: [
      {
        path: 'authorize/:uuid',
        loadChildren: () => import('./components/actions/authorize').then(m => m.ActionAuthorizeModule),
        outlet: 'actions',
      },
      {
        path: 'cancel/:uuid',
        loadChildren: () => import('./components/actions/cancel').then(m => m.ActionCancelModule),
        outlet: 'actions',
      },
      {
        path: 'credit_response/:uuid',
        loadChildren: () => import('./components/actions/credit-answer').then(m => m.ActionCreditAnswerModule),
        outlet: 'actions',
      },
      {
        path: 'refund/:uuid',
        loadChildren: () => import('./components/actions/refund').then(m => m.ActionRefundModule),
        outlet: 'actions',
      },
      {
        path: 'shipping_goods/:uuid',
        loadChildren: () => import('./components/actions/shipping-goods').then(m => m.ActionShippingGoodsModule),
        outlet: 'actions',
      },
      {
        path: 'signing_link_qr/:uuid',
        loadChildren: () => import('./components/actions/signing-link-qr').then(m => m.ActionSigningLinkQrModule),
        outlet: 'actions',
      },
      {
        path: 'download_shipping_slip/:uuid',
        loadChildren: () => import('./components/actions/download-slip').then(m => m.ActionDownloadSlipModule),
        outlet: 'actions',
      },
      {
        path: 'change_amount/:uuid',
        loadChildren: () => import('./components/actions/change-amount').then(m => m.ActionChangeAmountModule),
        outlet: 'actions',
      },
      {
        path: 'edit_reference/:uuid',
        loadChildren: () =>
          import('./components/actions/change-reference').then(m => m.ActionChangeReferenceModule),
        outlet: 'actions',
      },
      {
        path: 'edit_delivery/:uuid',
        loadChildren: () => import('./components/actions/change-delivery').then(m => m.ActionChangeDeliveryModule),
        outlet: 'actions',
      },
      {
        path: 'capture/:uuid',
        loadChildren: () => import('./components/actions/capture').then(m => m.ActionCaptureModule),
        outlet: 'actions',
      },
      {
        path: 'edit/:uuid',
        loadChildren: () => import('./components/actions/edit').then(m => m.ActionEditModule),
        outlet: 'actions',
      },
      {
        path: 'invoice/:uuid',
        loadChildren: () => import('./components/actions/invoice').then(m => m.ActionInvoiceModule),
        outlet: 'actions',
      },
      {
        path: 'paid/:uuid',
        loadChildren: () => import('./components/actions/paid').then(m => m.ActionPaidModule),
        outlet: 'actions',
      },
      {
        path: 'verify',
        loadChildren: () => import('./components/actions/verify').then(m => m.ActionsVerifyModule),
        outlet: 'actions',
      },
      {
        path: 'upload/:uuid',
        loadChildren: () => import('./components/actions/upload').then(m => m.ActionUploadModule),
        outlet: 'actions',
      },
      {
        path: 'claim/:uuid',
        loadChildren: () => import('./components/actions/claim').then(m => m.ActionClaimModule),
        outlet: 'actions',
      },
      {
        path: 'claim_upload/:uuid',
        loadChildren: () => import('./components/actions/claim').then(m => m.ActionClaimModule),
        outlet: 'actions',
      },
      {
        path: 'void/:uuid',
        loadChildren: () => import('./components/actions/void').then(m => m.ActionVoidModule),
        outlet: 'actions',
      },
    ],
  },
];

export const RouterWithChild: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterWithChild],
  exports: [RouterModule],
})
export class TransactionsDetailsRoutingModule {}
