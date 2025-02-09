import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { UiModule as SdkUiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { ProductsEditContainerComponent } from './components';
import { ProductsService, ProductsStorageService, ProductsApiService } from './services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,

    SdkUiModule,
    UtilsModule,
    CheckoutFormsCoreModule,
  ],
  declarations: [
    ProductsEditContainerComponent,
  ],
  providers: [
    ProductsService,
    ProductsApiService,
    ProductsStorageService,
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PRODUCTS_EDIT',
      },
    },
  ],
})
export class ProductsEditModule {
  resolveProductsEditContainerComponent(): Type<ProductsEditContainerComponent> {
    return ProductsEditContainerComponent;
  }
}
