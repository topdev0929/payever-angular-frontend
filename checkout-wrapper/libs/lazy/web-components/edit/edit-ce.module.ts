import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { CheckoutWrapperModule } from '@pe/checkout/main';
import { PluginsModule } from '@pe/checkout/plugins';
import { StorageModule } from '@pe/checkout/storage';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';
import { SkeletonWrapperModule } from '@pe/checkout/web-components/shared';

import { BaseWebComponentModule } from '../shared/base-web-component.module';

import { CheckoutWrapperEditTransactionComponent } from './checkout-wrapper-edit-transaction.component';

@NgModule({
  declarations: [
    CheckoutWrapperEditTransactionComponent,
  ],
  imports: [
    CommonModule,
    PluginsModule,
    StorageModule,
    UiModule,
    UtilsModule,

    MatButtonModule,
    MatExpansionModule,

    SkeletonWrapperModule,
    CheckoutWrapperModule,
  ],
})
export class CeEditModule extends BaseWebComponentModule {
  resolveComponent(): Type<CheckoutWrapperEditTransactionComponent> {
    return CheckoutWrapperEditTransactionComponent;
  }
}
