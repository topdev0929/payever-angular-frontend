import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { I18nModule } from '@pe/i18n';
import { PeSharedModule } from '@pe/message';

import { PeMessageProductsRootComponent } from './message-products-root.component';

export const productsRoutes: Routes = [
  {
    path: '',
    component: PeMessageProductsRootComponent,
    children: [
      {
        path: '',
        // eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
        loadChildren: () => import('@pe/apps/products').then(m => m.ProductsModule),
        data: {
          i18nDomains: ['commerceos-products-list-app', 'commerceos-products-editor-app', 'data-grid-app'],
          isFromDashboard: true,
        },
      },
    ],
  },
];

export const PeProductsRouterModuleForChild = RouterModule.forChild(productsRoutes);

@NgModule({
  declarations: [
    PeMessageProductsRootComponent,
  ],
  imports: [
    CommonModule,
    I18nModule,
    PeSharedModule,

    PeProductsRouterModuleForChild,
  ],
  exports: [],
  providers: [
    PeAuthService,
  ],
})
export class PeMessageProductsModule {}
