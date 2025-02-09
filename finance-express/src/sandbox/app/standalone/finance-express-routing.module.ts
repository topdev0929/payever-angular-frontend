import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { PanelChannelsComponent } from './component/channels/channels.component';
import { HomeComponent } from './component/home/home.component';
import { FinexpWidgetComponent } from './component/finexp-widget/finexp-widget.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'business/:slug/checkout/:checkoutUuid/panel-channels',
    component: PanelChannelsComponent
  },
  {
    path: 'business/:slug/checkout/:checkoutUuid/channels',
    loadChildren: () => import('../../../modules/finexp-editor/src/finexp.module').then(
      m => m.FinexpModule
    ),
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['finexp-app', 'checkout', 'checkout-app', 'connect-app', 'connect-integrations'],
    },
  },
  {
    path: 'finexp-widget-test/channelSetId/:channelSetId/type/:type',
    component: FinexpWidgetComponent
  },
  // {
  //   path: 'business/:slug/checkout/:checkoutUuid/channels',
  //   loadChildren: () => import('../../../modules/finance-express/src/deprecated/finexp.module').then(
  //     m => m.FinexpModule
  //   )
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class FinanceExpressRoutingModule {
}
