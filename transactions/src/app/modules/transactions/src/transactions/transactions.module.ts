import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AddressModule } from '@pe/ng-kit/modules/address';
import { AuthModule } from '@pe/ng-kit/modules/auth';
import { ButtonModule } from '@pe/ng-kit/modules/button';
import { DataGridModule } from '@pe/ng-kit/modules/data-grid';
import { FormModule } from '@pe/ng-kit/modules/form';
import { FormDeprecatedModule } from '@pe/ng-kit/modules/form-deprecated';
import { FormComponentsSelectModule } from '@pe/ng-kit/modules/form-components-select';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { MediaModule } from '@pe/ng-kit/modules/media';
import { MicroModule } from '@pe/ng-kit/modules/micro';
import { MobileModule } from '@pe/ng-kit/modules/mobile';
import { PeModalModule } from '@pe/ng-kit/modules/modal';
import { NavbarModule } from '@pe/ng-kit/modules/navbar';
import { OverlayBoxModule } from '@pe/ng-kit/modules/overlay-box';
import { SnackBarModule } from '@pe/ng-kit/modules/snack-bar';
import { TableModule } from '@pe/ng-kit/modules/table';

import { CheckoutApiModule } from '@pe/checkout-sdk/sdk/api';
import { FormUtilsModule } from '@pe/checkout-sdk/sdk/form-utils';
import { StorageModule } from '@pe/checkout-sdk/sdk/storage';
import { PluginsModule } from '@pe/checkout-sdk/sdk/plugins';
import { ProductsModule } from '@pe/checkout-sdk/sdk/products';

import {
  TransactionsListContainerComponent,
  TransactionsListComponent,
  TransactionExportsComponent
} from './components';
import { DataGridResolver, FullStoryGuard, LoadingResolver, PlatformHeaderGuard } from './resolvers';
import { RoutingModule } from './routing.module';
import { SharedModule } from '../shared';

import { BusinessDataEffects, FiltersEffects, TransactionsEffects } from '../shared/state-management/effects';
import { reducer } from '../shared/state-management/reducer';

import { OrderModule } from '../order/order.module';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,

    // OrderModule, // Remove this line if you want to have order module in separate chunk

    SharedModule,
    SharedModule.forRoot(),

    AuthModule.forRoot(),

    // TODO Somehow move following to SharedModule:
    EffectsModule.forFeature([BusinessDataEffects, FiltersEffects, TransactionsEffects]),
    StoreModule.forFeature('orders', reducer),

    // StoreModule.forRoot({}),
    // EffectsModule.forRoot(rootNgrxEffects),
    // SharedModule.forRoot(),
    /*
    FormsModule,
    ReactiveFormsModule,

    MatCardModule,
    MatExpansionModule,
    MatInputModule,
    MatListModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    PopoverModule.forRoot(),

    AddressModule,
    ButtonModule,
    FormModule,
    FormDeprecatedModule,
    FormComponentsSelectModule,
    MediaModule,
    MicroModule,
    MobileModule,
    PeModalModule,
    NavbarModule,
    OverlayBoxModule,
    SnackBarModule,

    CheckoutApiModule,
    FormUtilsModule,
    StorageModule,
    PluginsModule,
    ProductsModule,
*/
    MatButtonModule,
    MatMenuModule,

    DataGridModule,
    I18nModule.forChild(),
    TableModule
  ],
  declarations: [
    TransactionsListContainerComponent,
    TransactionsListComponent,
    TransactionExportsComponent
  ],
  providers: [
    DataGridResolver,
    FullStoryGuard,
    LoadingResolver,
    PlatformHeaderGuard
  ]
})
export class PeTransactionsModule {
  static forRoot(): ModuleWithProviders<PeTransactionsModule> {
    return {
      ngModule: PeTransactionsModule,
      providers: [
      ]
    };
  }
}
