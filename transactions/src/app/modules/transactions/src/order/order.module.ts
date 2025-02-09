import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
// import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';
import { PopoverModule } from 'ngx-bootstrap/popover';

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
import { StatisticsModule } from '@pe/checkout-sdk/sdk/statistics';
import { FormUtilsModule } from '@pe/checkout-sdk/sdk/form-utils';
import { StorageModule } from '@pe/checkout-sdk/sdk/storage';
import { PluginsModule } from '@pe/checkout-sdk/sdk/plugins';
import { ProductsModule } from '@pe/checkout-sdk/sdk/products';

import {
  ActionsListComponent,
  ActionModalComponent,

  ActionAuthorizeComponent,
  ActionCancelComponent,
  ActionCaptureComponent,
  ActionChangeAmountComponent,
  ActionChangeReferenceComponent,
  ActionCreditAnswerComponent,
  ActionEditComponent,
  AmountEditComponent,
  CartEditComponent,
  BillingAddressEditComponent,
  ActionPaidComponent,
  ActionRefundComponent,
  ActionRemindComponent,
  ActionShippingGoodsComponent,
  ActionVerifyComponent,
  ActionUpdateComponent,
  ActionUploadComponent,
  ActionVoidComponent,
  ActionDownloadSlipComponent,

  DetailsContainerComponent,

  DetailsComponent
} from './components';
import { DetailService } from './services';
import { RoutingModule } from './routing.module';
import { SharedModule } from '../shared';

@NgModule({
  imports: [
    CommonModule,
    RoutingModule,
    FormsModule,
    ReactiveFormsModule,
    /*
    StoreModule.forFeature('orders', reducer),
    EffectsModule.forFeature([
      BusinessDataEffects,
      FiltersEffects,
      TransactionsEffects
    ]),*/

    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatInputModule,
    MatListModule,
    MatSortModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    PopoverModule.forRoot(),

    AddressModule,
    AuthModule.forRoot(),
    ButtonModule,
    DataGridModule,
    FormModule,
    FormDeprecatedModule,
    FormComponentsSelectModule,
    I18nModule.forChild(),
    MediaModule,
    MicroModule,
    MobileModule,
    PeModalModule,
    NavbarModule,
    OverlayBoxModule,
    SnackBarModule,
    TableModule,

    CheckoutApiModule,
    StatisticsModule,
    StatisticsModule.forRoot(),
    FormUtilsModule,
    StorageModule,
    PluginsModule,
    ProductsModule,

    SharedModule
  ],
  declarations: [
    ActionsListComponent,
    ActionModalComponent,

    ActionAuthorizeComponent,
    ActionCancelComponent,
    ActionCaptureComponent,
    ActionChangeAmountComponent,
    ActionChangeReferenceComponent,
    ActionCreditAnswerComponent,
    ActionEditComponent,
    AmountEditComponent,
    CartEditComponent,
    BillingAddressEditComponent,
    ActionPaidComponent,
    ActionRefundComponent,
    ActionRemindComponent,
    ActionShippingGoodsComponent,
    ActionVerifyComponent,
    ActionUpdateComponent,
    ActionUploadComponent,
    ActionVoidComponent,
    ActionDownloadSlipComponent,

    DetailsContainerComponent,

    DetailsComponent
  ],
  providers: [
    DetailService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class OrderModule {}
