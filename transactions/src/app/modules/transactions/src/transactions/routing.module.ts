import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ResetTemporarySecondFactorGuard } from '@pe/ng-kit/modules/auth';
import { TranslationGuard } from '@pe/ng-kit/modules/i18n';

import {
  TransactionsListContainerComponent
} from './components';
import { DataGridResolver, FullStoryGuard, LoadingResolver, PlatformHeaderGuard } from './resolvers';
import { ENABLE_2FA } from '../shared';

const activators: any[] = [FullStoryGuard, TranslationGuard];
const i18nDomains: string[] = ['transactions-app', 'transactions-specific-statuses', 'ng-kit', 'ng-kit-ng-kit', 'connect-integrations'];

const routes: Routes = [
  {
    path: '',
    resolve: {
      LoadingResolver
    },
    children: [
      {
        path: '',
        canActivate: ENABLE_2FA ?
          [DataGridResolver, ...activators, ResetTemporarySecondFactorGuard] :
          [DataGridResolver, ...activators], // Can't be any parent of ActionEditComponent
        data: {
          i18nDomains
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'list'
          },
          {
            path: 'list',
            component: TransactionsListContainerComponent,
            canActivate: [PlatformHeaderGuard]
          }
        ]
      },
      {
        path: ':orderId',
        canActivate: ENABLE_2FA ? [ResetTemporarySecondFactorGuard, ...activators] : activators, // Can't be any parent of ActionEditComponent
        data: {
          i18nDomains
        },
        loadChildren: () => import('../order/order.module').then(m => m.OrderModule)
      }
    ]
  }
];

// @dynamic
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutingModule {}
