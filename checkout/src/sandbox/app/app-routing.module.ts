import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { MicroReturnComponent } from './components';

const appRoutes: Routes = [
  {
    path: 'business/:businessUuid/checkout',
    // loadChildren: () => import('../../modules/checkout/src/checkout.module').then(m => m.CheckoutModule),
    loadChildren: () => import('@pe/checkout').then(m => {
      return m.CheckoutModule;
    }),
    canActivate: [
      // TranslationGuard
    ],
    data: {
      dependencies: {
        micros: ['connect']
      },
      useMicroUrlsFromRegistry: true,
      // i18nDomains: ['checkout-app', 'connect-integrations', 'ng-kit-ng-kit'],
    }
  },
  {
    path: '**',
    component: MicroReturnComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
