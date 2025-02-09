import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { NgxsModule } from '@ngxs/store';

import { PeDataGridModule, PeDataGridService } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { PeSidebarModule } from '@pe/sidebar';
import { I18nModule } from '@pe/i18n';
import { PebButtonModule } from '@pe/ui';
import { SnackbarService } from '@pe/snackbar';
import { ProductsState } from '@pe/common';

import { SharedModule } from '../shared/shared.module';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ImportMenuComponent } from './components/import-menu/import-menu.component';
import { ChannelsService } from '../product-editor';
import { EditMenuComponent } from './components/edit-menu/edit-menu.component';

export const I18nModuleForChild: ModuleWithProviders<I18nModule> = I18nModule.forChild();

export const NgxsFeatureModule = NgxsModule.forFeature([ProductsState]);

const routes: Routes = [
  {
    path: '',
    component: ProductsListComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list',
  },
];

export const ProductsListRouteModuleWithRoutes = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    PeDataGridModule,
    PeFiltersModule,
    PeSidebarModule,
    SharedModule,
    FormsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    NgxsFeatureModule,
    I18nModuleForChild,
    ProductsListRouteModuleWithRoutes,
    MatMenuModule,
    MatIconModule,
    PebButtonModule,
  ],
  exports: [],
  declarations: [
    EditMenuComponent,
    ImportMenuComponent,
    ProductsListComponent,
  ],
  providers: [
    SnackbarService,
    ChannelsService,
    PeDataGridService,
  ],
})
export class ProductsListModule {}
