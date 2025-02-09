import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { OptionTypePickerComponent } from './components/option-type-picker/option-type-picker.component';
import { VariantEditorComponent } from './components/variant-editor/variant-editor.component';
import { EditorComponent } from './containers/editor/editor.component';
import { ProductResolver } from './resolvers/product.resolver';
import { RecurringBillingResolver } from './resolvers/recurring-billing.resolver';
import { VatRatesResolver } from './resolvers/vat-rates.resolver';

const routes: Routes = [
  {
    path: 'edit/:productId',
    component: EditorComponent,
    resolve: {
      product: ProductResolver,
      vatRates: VatRatesResolver,
      recurringBilling: RecurringBillingResolver,
    },
    data: {
      isProductEdit: true,
    },
    children: [
      {
        component: VariantEditorComponent,
        path: 'variant',
        data: {
          isVariantEdit: false,
        },
        outlet: 'auxiliary',
      },
      {
        component: VariantEditorComponent,
        path: 'variant/:variantId',
        data: {
          isVariantEdit: true,
        },
        resolve: {
          product: ProductResolver,
        },
        outlet: 'auxiliary',
      },
      {
        path: 'option-type-picker',
        component: OptionTypePickerComponent,
        outlet: 'auxiliary',
      },
      {
        path: 'option-type-picker/:variantId',
        component: OptionTypePickerComponent,
        outlet: 'auxiliary',
      },
      {
        path: 'color-picker',
        component: ColorPickerComponent,
        outlet: 'auxiliary',
      },
      {
        path: 'color-picker/:variantId',
        component: ColorPickerComponent,
        outlet: 'auxiliary',
      },
    ],
  },
  {
    path: 'add',
    component: EditorComponent,
    resolve: {
      vatRates: VatRatesResolver,
      recurringBilling: RecurringBillingResolver,
    },
    data: {
      isProductEdit: false,
    },
    children: [
      {
        path: 'color-picker',
        component: ColorPickerComponent,
        outlet: 'auxiliary',
      },
      {
        path: 'option-type-picker',
        component: OptionTypePickerComponent,
        outlet: 'auxiliary',
      },
      {
        component: VariantEditorComponent,
        path: 'variant',
        data: {
          isVariantEdit: false,
        },
        outlet: 'auxiliary',
      },
      {
        component: VariantEditorComponent,
        path: 'variant/:variantId',
        data: {
          isVariantEdit: true,
        },
        resolve: {
          product: ProductResolver,
        },
        outlet: 'auxiliary',
      },
    ],
  },
  {
    path: '**',
    resolve: {
      vatRates: VatRatesResolver,
      recurringBilling: RecurringBillingResolver,
    },
    component: EditorComponent,
  },
];

export const RouterWithChild: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterWithChild],
  exports: [RouterModule],
})
export class ProductsEditorRoutingModule {}
