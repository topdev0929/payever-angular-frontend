import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeMessageBusinessResolver } from './resolvers';
import { PeMessageComponent } from './message.component';
import {
  PeMessageConnectRootComponent,
  PeMessageIntegrationRootComponent,
  PeMessageChannelRootComponent,
} from './components';
import { PeMessageGuardRoles } from './enums';

import { RolesGuard } from './guards/roles.guard';

const routes: Routes = [
  {
    path: '',
    component: PeMessageComponent,
    resolve: {
      business: PeMessageBusinessResolver,
    },
    canActivateChild: [RolesGuard],
    children: [
      {
        path: 'integration',
        component: PeMessageIntegrationRootComponent,
        data: {
          allowedRoles: [PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin],
        },
      },
      {
        path: 'connect',
        component: PeMessageConnectRootComponent,
        data: {
          allowedRoles: [PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin],
        },
      },
      {
        path: 'channel',
        component: PeMessageChannelRootComponent,
        data: {
          allowedRoles: [PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin],
        },
      },
    ],
  },
  {
    path: ':chatId',
    component: PeMessageComponent,
    resolve: {
      business: PeMessageBusinessResolver,
    },
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [],
})
export class PeMessageRouteModule {}
