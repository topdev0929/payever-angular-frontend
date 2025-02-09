import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClipboardModule } from 'ngx-clipboard';
import { RouterModule } from '@angular/router';

import { AuthModule } from '@pe/auth';
import { AddressModule, FormModule, SnackBarModule } from '@pe/forms';
import { MediaModule } from '@pe/media';
import { I18nModule } from '@pe/i18n';

import { ButtonModule } from '../../../ngkit-modules/button';
import { NavbarModule } from '../../../ngkit-modules/navbar';
import { OverlayBoxModule } from '../../../ngkit-modules/overlay-box';

import { SharedModule as BaseSharedModule } from '../../../shared/shared.module';
import {
  PaymentExternalAuthenticationComponent,
  PaymentExternalRegistrationComponent,
  PaymentDocumentsComponent,
  PaymentMainWrapComponent,
  PaymentAddConnectionVariantComponent,
  PaymentReadonlyChannelComponent,
  PaymentReadonlyStoreIdComponent,
  PaymentReadonlyVendorIdsComponent,
  PaymentReadonlyVendorNumberComponent,
  PaymentSettingsAcceptFeeComponent,
  PaymentSettingsConditionComponent,
  PaymentSettingsDelayedPaymentsComponent,
  PaymentSettingsInvoiceFeeComponent,
  PaymentSettingsIsDownPaymentAllowedComponent,
  PaymentSettingsIsEmailNotificationAllowedComponent,
  PaymentSettingsPayExCaptureEnabledComponent,
  PaymentSettingsPaymentActionComponent,
  PaymentSettingsSaveButtonComponent,
  PaymentSettingsShopRedirectEnabledComponent,
  PaymentSettingsStatementDescriptorComponent
} from './components';
import { ConstantsService, StepsHelperService } from './services';
// import { ACCOUNT_PROVIDERS } from './components/base-account-santander/base-account-santander.component';

export const PaymentsSharedI18nModuleForChild = I18nModule.forChild();

@NgModule({
  declarations: [
    PaymentExternalAuthenticationComponent,
    PaymentExternalRegistrationComponent,
    PaymentDocumentsComponent,
    PaymentMainWrapComponent,
    PaymentAddConnectionVariantComponent,
    PaymentReadonlyChannelComponent,
    PaymentReadonlyStoreIdComponent,
    PaymentReadonlyVendorIdsComponent,
    PaymentReadonlyVendorNumberComponent,
    PaymentSettingsAcceptFeeComponent,
    PaymentSettingsConditionComponent,
    PaymentSettingsDelayedPaymentsComponent,
    PaymentSettingsInvoiceFeeComponent,
    PaymentSettingsIsDownPaymentAllowedComponent,
    PaymentSettingsIsEmailNotificationAllowedComponent,
    PaymentSettingsPayExCaptureEnabledComponent,
    PaymentSettingsPaymentActionComponent,
    PaymentSettingsSaveButtonComponent,
    PaymentSettingsShopRedirectEnabledComponent,
    PaymentSettingsStatementDescriptorComponent
  ],
  imports: [
    CommonModule,

    AuthModule,
    AddressModule,
    MediaModule,
    ButtonModule,
    ClipboardModule,
    PaymentsSharedI18nModuleForChild,
    FormModule,
    FormsModule,
    SnackBarModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,

    NavbarModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,

    BaseSharedModule,
  ],
  providers: [
    FormBuilder,
    ConstantsService,
    StepsHelperService,

    // ...ACCOUNT_PROVIDERS

    // Important note:
    // We do not declare ApiService, StateService, DocumentUploadService, NavigationService here to avoid multiple instances.
    // Both are declared in root payment module.
    // TODO Move them to SharedModule.forRoot()
  ],
  exports: [
    PaymentExternalAuthenticationComponent,
    PaymentExternalRegistrationComponent,
    PaymentDocumentsComponent,
    PaymentMainWrapComponent,
    PaymentAddConnectionVariantComponent,
    PaymentReadonlyChannelComponent,
    PaymentReadonlyStoreIdComponent,
    PaymentReadonlyVendorIdsComponent,
    PaymentReadonlyVendorNumberComponent,
    PaymentSettingsAcceptFeeComponent,
    PaymentSettingsConditionComponent,
    PaymentSettingsDelayedPaymentsComponent,
    PaymentSettingsInvoiceFeeComponent,
    PaymentSettingsIsDownPaymentAllowedComponent,
    PaymentSettingsIsEmailNotificationAllowedComponent,
    PaymentSettingsPayExCaptureEnabledComponent,
    PaymentSettingsPaymentActionComponent,
    PaymentSettingsSaveButtonComponent,
    PaymentSettingsShopRedirectEnabledComponent,
    PaymentSettingsStatementDescriptorComponent,

    // BaseSharedModule
  ]
})
export class PaymentsSharedModule {}
