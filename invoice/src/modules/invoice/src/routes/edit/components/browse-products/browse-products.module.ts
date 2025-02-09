import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';
import { MediaModule } from '@pe/media';
import { TranslationGuard } from '@pe/i18n';
import { PebEnvService } from '@pe/builder-core';
import { EnvService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';

import { PeBrowseProductsFormComponent } from './browse-products.component';

import { DragulaModule } from 'ng2-dragula';
(window as any).PayeverStatic.IconLoader.loadIcons([
  'edit-panel',
]);

const routes: Route[] = [
  {
    path: '',
    component: PeBrowseProductsFormComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['products-list', 'products-editor', 'data-grid-app'],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        data: {
          overlay: true
        },
        loadChildren: () => import('@pe/products-app').then(m => m.ProductsModule),
      },
    ],
  },
];
export const routerModuleForChild = RouterModule.forChild(routes);
export const dragulaModule = DragulaModule.forRoot();
// @dynamic
@NgModule({
  exports: [RouterModule],
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    routerModuleForChild,
    PeSimpleStepperModule,
    MediaModule,
    dragulaModule,
  ],
  declarations: [PeBrowseProductsFormComponent],
  providers: [
    PeDataGridService,
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
  ],
})

export class PeBrowseProductsModule {}
