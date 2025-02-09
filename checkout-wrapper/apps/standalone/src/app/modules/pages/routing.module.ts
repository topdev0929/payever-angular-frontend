import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { DeviceUuidGuard, ExternalNavigateDataQueryGuard } from '../../guards';

import { ShowWrapperComponent } from './components/show-wrapper/show-wrapper.component';
import {
  SaveGuestTokenGuard,
} from './guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pay',
    pathMatch: 'full',
  },
  {
    path: 'pay',
    canActivate: [SaveGuestTokenGuard],
    children: [
      {
        path: 'flow-generator',
        loadChildren:
          () => import('./flow-generator')
          .then(m => m.FlowGeneratorModule),
      },
      {
        path: 'download-file',
        canActivate: [ExternalNavigateDataQueryGuard],
        loadChildren:
          () => import('./components/download-file')
          .then(m => m.DownloadFileModule),
      },
      {
        path: 'set-cookie-and-redirect',
        canActivate: [ExternalNavigateDataQueryGuard],
        loadChildren:
          () => import('./components/set-cookie-and-redirect')
            .then(m => m.SetCookieAndRedirectModule),
      },
      {
        path: 'static-finish',
        loadChildren:
          () => import('./static-finish/static-finish.module')
            .then(m => m.StaticFinishModule),
      },
      {
        path: 'static-verified',
        loadChildren:
          () => import('./static-verified/static-verified.module')
            .then(m => m.StaticVerifiedModule),
      },
      {
        path: ':flowId',
        children: [
          {
            path: 'redirect-out-of-iframe',
            loadChildren:
              () => import('./components/redirect-out-of-iframe')
                .then(m => m.RedirectOutOfIframeModule),
          },

          // These pages are added for case when we need to redirect user when contract is signed
          // It happens in few days and payment flow already remove. This is why we use just static pages.
          // As I remember it's only for Norway
          {
            path: 'static-finish/success',
            redirectTo: 'static-finish/success',
          },
          {
            path: 'static-finish/fail',
            redirectTo: 'static-finish/fail',
          },
          {
            path: 'static-finish/cancel',
            redirectTo: 'static-finish/cancel',
          },
          {
            path: 'static-finish',
            loadChildren:
              () => import('./static-finish/static-finish.module')
                .then(m => m.StaticFinishModule),
          },
          {
            path: 'stripe-postback',
            canActivate: [ExternalNavigateDataQueryGuard],
            loadChildren:
              () => import('./components/flow-stripe-postback')
                .then(m => m.FlowStripePostbackModule),
          },

          {
            // This one we use for Sofort and PayPal
            // @deprecated, use `redirect-to-payment` instead
            path: 'shipping/receipt',
            canActivate: [ExternalNavigateDataQueryGuard],
            loadChildren:
              () => import('./components/open-payment-step-after-redirect')
                .then(m => m.OpenPaymentStepAfterRedirectModule),
          },

          {
            // This one we use for Santander NL
            path: 'redirect-to-payment',
            canActivate: [
              ExternalNavigateDataQueryGuard,
              DeviceUuidGuard,
            ],
            loadChildren:
              () => import('./components/open-payment-step-after-redirect')
                .then(m => m.OpenPaymentStepAfterRedirectModule),
          },
          {
            // This one we use for Santander NL
            path: 'redirect-to-choose-payment',
            canActivate: [
              ExternalNavigateDataQueryGuard,
              DeviceUuidGuard,
            ],
            loadChildren:
              () => import('./components/open-choose-payment-step-after-redirect')
                .then(m => m.OpenChoosePaymentStepAfterRedirectModule),
          },

          {
            path: '',
            canActivate: [ExternalNavigateDataQueryGuard],
            component: ShowWrapperComponent,
          },

          // To handle some old routes, for example /amount
          // or /payment/santander_installment_dk/step-2?duration=10&productId=5
          {
            path: '',
            children: [{
              path: '**',
              loadChildren:
                () => import('./components/fix-route/fix-route.module')
                .then(m => m.FixRouteModule),
            }],
          },
        ],
      },
      {
        path: '**',
        loadChildren:
          () => import('./components/error404/error404.module')
          .then(m => m.Error404Module),
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class RoutingModule {
}
