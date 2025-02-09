import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BusinessGuard } from './guards/business-guard.service';
import { ProductsModule } from './modules/products/src/src/products.module';

// TODO: need to return translations guard
const routes: Routes = [
  {
    path: 'business/:slug',
    canActivate: [BusinessGuard],
    children: [
      {
        path: 'products',
        loadChildren: () => ProductsModule,
        data: {
          i18nDomains: ['products-list', 'products-editor', 'ng-kit-ng-kit'],
          isFromDashboard: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
