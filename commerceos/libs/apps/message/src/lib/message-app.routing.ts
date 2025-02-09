import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  PeMessageInviteRootComponent,
  PeMessageGroupRootComponent,
  RolesGuard,
} from '@pe/message';
import { PeMessageGuardRoles } from '@pe/message/shared';

import { PeMessageAppComponent } from './message-app.component';
import { CosMessageRootComponent } from './root/message-root.component';

function loadIntegrationModule() {
  return import('@pe/message').then(m => m.PeIntegrationModule);
}

function loadContactsModule() {
  return import('./modules/contacts/message-contacts.module').then(m => m.PeMessageContactsModule);
}

function loadConnectModule() {
  return import('./modules/connect/message-connect.module').then(m => m.PeMessageConnectModule);
}

function loadProductsModule() {
  return import('./modules/products/message-products.module').then(m => m.PeMessageProductsModule);
}

const data = {
  allowedRoles: [PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin],
};

const routes: Routes = [
  {
    path: '',
    component: CosMessageRootComponent,
    children: [
      {
        path: '',
        component: PeMessageAppComponent,
        canActivateChild: [RolesGuard],
        children: [
          {
            path: 'integration',
            loadChildren: loadIntegrationModule,
            data,
          },
          {
            path: 'connect',
            loadChildren: () => import('@pe/message').then(m => m.PeConnectMessageModule),
            data,
          },
          {
            path: 'channel',
            loadChildren: () => import('@pe/message').then(m => m.PeChannelModule),
            data,
          },
          {
            path: 'invite',
            component: PeMessageInviteRootComponent,
            data,
          },
          {
            path: 'group',
            component: PeMessageGroupRootComponent,
            data,
          },
          {
            path: 'contacts',
            loadChildren: loadContactsModule,
            data,
          },
          {
            path: 'products',
            loadChildren: loadProductsModule,
            data,
          },
          {
            path: 'connect-app',
            loadChildren: loadConnectModule,
            data,
          },
        ],
      },
      {
        path: ':chatId',
        component: PeMessageAppComponent,
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
export class PeMessageAppRouteModule { }
