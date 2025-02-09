import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeInvoiceComponent } from './routes/_root/invoice-root.component';
import { PeInvoiceGridComponent } from './routes/grid/invoice-grid.component';
import { PeInvoiceEditorModule } from './routes/editor/invoice-editor.module';
import { PebThemeGridComponent } from './routes/theme-grid/theme-grid.component';
import { PeInvoiceSettingsComponent } from './routes/settings/settings.component';
import { PebInvoiceGuard } from './guards/invoice.guard';
import { InvoiceThemeGuard } from './guards/theme.guard';
import { PeBrowseProductsModule } from './routes/edit/components/browse-products/browse-products.module';
import { PeBrowseContactsModule } from './routes/edit/components/browse-contacts/browse-contacts.module';

export function editorModule() {
  return PeInvoiceEditorModule;
}

export function browseProductsModule() {
  return PeBrowseProductsModule;
}
export function browseContactsModule() {
  return PeBrowseContactsModule;
}

const routes: Routes = [
  {
    path: '',
    component: PeInvoiceComponent,
    canActivate: [PebInvoiceGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PeInvoiceGridComponent,
      },
      {
        path: 'list',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: '',
        component: PeInvoiceGridComponent,
      },
      {
        path: 'add-product',
        loadChildren: browseProductsModule,
      },
      {
        path: 'add-contact',
        loadChildren: browseContactsModule,
      },
      {
        path: 'themes',
        canActivate: [InvoiceThemeGuard],
        children:[
          {
            path: ':invoiceId',
            component: PebThemeGridComponent,
          },
          {
            path: '',
            component: PebThemeGridComponent,
          },
        ]
      },
      {
        path: 'edit',
        loadChildren: editorModule,
      },
      {
        path: 'builder/:themeId/edit',
        loadChildren: editorModule,
      },
      {
        path: 'settings',
        component: PeInvoiceSettingsComponent,
      },

      {
        path:':invoiceId',
        children:[
          {
            path: 'edit',
            loadChildren: editorModule,
          },
        ]
      }
    ],
  },
];

export const RouterModuleForChild: any = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [],
})
export class PeInvoiceRouteModule {}
