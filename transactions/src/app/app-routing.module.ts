import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnvironmentConfigGuard } from '@pe/ng-kit/modules/environment-config';

import { MicroReturnComponent } from './components';

// import { OrdersModule } from './modules/transactions/transactions.module';

const appRoutes: Routes = [
  {
    path: 'business',
    children: [
      {
        path: ':uuid/transactions',
        loadChildren: () => import('./modules/transactions/src/transactions/transactions.module').then(m => m.PeTransactionsModule.forRoot().ngModule),
        data: {
          businessMode: true // TODO Check that it works
        }
      }
    ],
    canActivate: [EnvironmentConfigGuard]
  },
  {
    path: 'personal',
    children: [
      {
        path: ':uuid/transactions',
        loadChildren: () => import('./modules/transactions/src/transactions/transactions.module').then(m => m.PeTransactionsModule.forRoot().ngModule),
        data: {
          businessMode: true // TODO Check that it works
        }
      }
    ],
    canActivate: [EnvironmentConfigGuard]
  },
  {
    path: 'private/transactions',
    loadChildren: () => import('./modules/transactions/src/transactions/transactions.module').then(m => m.PeTransactionsModule.forRoot().ngModule),
    canActivate: [EnvironmentConfigGuard],
    data: {
      businessMode: false // TODO Check that it works
    }
  },
  {
    path: '**',
    component: MicroReturnComponent
  }
];

@NgModule({
  imports: [
    // Uncomment following line if you want to include chunk into main micro.js file
    // OrdersModule,
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
