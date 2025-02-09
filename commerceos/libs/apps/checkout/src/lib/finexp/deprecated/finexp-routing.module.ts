import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  BubbleComponent,
  ButtonComponent,
  CalculatorComponent, MarketingAppComponent, PosAppComponent, QRAppComponent,
  StoreAppComponent,
  TextLinkComponent,
} from './components/channels';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'text-link',
        component: TextLinkComponent,
      },
      {
        path: 'button',
        component: ButtonComponent,
      },
      {
        path: 'calculator',
        component: CalculatorComponent,
      },
      {
        path: 'bubble',
        component: BubbleComponent,
      },

      {
        path: 'shop-app',
        component: StoreAppComponent,
      },
      {
        path: 'pos-app',
        component: PosAppComponent,
      },
      {
        path: 'qr-app',
        component: QRAppComponent,
      },
      {
        path: 'marketing-app',
        component: MarketingAppComponent,
      },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class FinexpRoutingModule {}
