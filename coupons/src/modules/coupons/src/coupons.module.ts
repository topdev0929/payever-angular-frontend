import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { AuthModule } from '@pe/auth';
import { PeDataGridModule } from '@pe/data-grid';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebDateTimePickerModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebSelectModule,
  PeDateTimePickerService,
} from '@pe/ui';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderModule } from '@pe/platform-header';

import { PeCouponsRouteModule } from './coupons.routing';
import { PeCouponsSharedModule } from './coupons.shared';
import { PeCouponsIconAddComponent } from './misc/icons/add';
import { PeCouponsIconDateComponent } from './misc/icons/date';
import { PeCouponsIconMagentoComponent } from './misc/icons/magento';
import { PeCouponsIconShopComponent } from './misc/icons/shop';
import { PeCouponsIconTimeComponent } from './misc/icons/time';
import { PeCouponsFormComponent } from './routes/form/coupons-form.component';
import { PeCouponsGridComponent } from './routes/grid/coupons-grid.component';
import { PeCouponsRootComponent } from './routes/root/coupons-root.component';
import { PeCouponsAutocompleteComponent } from './misc/components/coupons-autocomplete/coupons-autocomplete.component';
import { PeCouponsCheckboxComponent } from './misc/components/coupons-checkbox/coupons-checkbox.component';
import { PeCouponsExpansionPanelComponent } from './misc/components/coupons-expansion-panel/coupons-expansion-panel.component';
import { PeCouponsFormFieldComponent } from './misc/components/coupons-form-field/coupons-form-field.component';
import { PeCouponsFormGroupComponent } from './misc/components/coupons-form-group/coupons-form-group.component';
import { PeCouponsListItemComponent } from './misc/components/coupons-list/coupons-list-item.component';
import { PeCouponsListComponent } from './misc/components/coupons-list/coupons-list.component';
import { PeCouponsSelectComponent } from './misc/components/coupons-select/coupons-select.component';
import { PeCouponsSlideToggleComponent } from './misc/components/coupons-slide-toggle/coupons-slide-toggle.component';
import { PeCouponsExpansionPanelContentDirective } from './misc/components/coupons-expansion-panel/coupons-expansion-panel-content.directive';
import { PeCouponsFormFieldLabelDirective } from './misc/components/coupons-form-field/coupons-form-field-label.directive';
import { PeCouponsFormFieldPrefixDirective } from './misc/components/coupons-form-field/coupons-form-field-prefix.directive';
import { PeCouponsFormFieldSuffixDirective } from './misc/components/coupons-form-field/coupons-form-field-suffix.directive';
import { PeCouponsFormFieldSubscriptDirective } from './misc/components/coupons-form-field/coupons-form-field-subscript.directive';
import { PeCouponsOverlayService, PE_OVERLAY_DATA } from './misc/services/coupons-overlay/coupons-overlay.service';
import { PeCouponsDatepickerComponent } from './misc/components/coupons-datepicker/coupons-datepicker.component';
import { PeDeleteConfirmationDialog } from './routes/dialogs/delete-confirmation-dialog/delete-confirmation.dialog';
import { PeDeleteCouponConfirmationDialog } from './routes/dialogs/delete-coupon-confirmation-dialog/delete-coupon-confirmation-dialog';
import { PeInfoDialog } from './routes/dialogs/info-dialog/info.dialog';
import { PeCancelCouponConfirmationDialog } from './routes/dialogs/cancel-coupon-confirmation-dialog/cancel-coupon-confirmation-dialog';
import { PeCouponsSubscriptDirective } from './misc/components/coupons-form-group/coupons-subscript.directive';
import { PeMoveToFolderDialog } from './routes/dialogs/move-to-folder-dialog/move-to-folder.dialog';
import { DataGridService } from './services/data-grid.service';

import { TextMaskModule } from 'angular2-text-mask';

const components = [
  PeCouponsAutocompleteComponent,
  PeCouponsCheckboxComponent,
  PeCouponsDatepickerComponent,
  PeCouponsExpansionPanelComponent,
  PeCouponsFormFieldComponent,
  PeCouponsFormGroupComponent,
  PeCouponsListComponent,
  PeCouponsListItemComponent,
  PeCouponsSelectComponent,
  PeCouponsSlideToggleComponent,
  PeDeleteConfirmationDialog,
  PeDeleteCouponConfirmationDialog,
  PeCancelCouponConfirmationDialog,
  PeMoveToFolderDialog,
  PeInfoDialog,
];

const directives = [
  PeCouponsExpansionPanelContentDirective,
  PeCouponsFormFieldPrefixDirective,
  PeCouponsFormFieldLabelDirective,
  PeCouponsFormFieldSubscriptDirective,
  PeCouponsFormFieldSuffixDirective,
  PeCouponsSubscriptDirective,
];

const icons = [
  PeCouponsIconAddComponent,
  PeCouponsIconDateComponent,
  PeCouponsIconMagentoComponent,
  PeCouponsIconShopComponent,
  PeCouponsIconTimeComponent,
];

@NgModule({
  imports: [
    AuthModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PeSidebarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatDialogModule,
    MatMomentDateModule,
    MatSelectModule,
    MatIconModule,
    PeCouponsRouteModule,
    PeCouponsSharedModule,
    PebButtonToggleModule,
    PeDataGridModule,
    PebFormBackgroundModule,
    NgScrollbarModule,
    TextMaskModule,
    I18nModule,
    MatNativeDateModule,
    PebDateTimePickerModule,
    PebFormFieldInputModule,
    PebButtonModule,
    PePlatformHeaderModule,
    PebSelectModule,
  ],
  declarations: [
    PeCouponsFormComponent,
    PeCouponsGridComponent,
    PeCouponsRootComponent,

    ...components,
    ...directives,
    ...icons,
  ],
  providers: [
    PeCouponsOverlayService,
    PeDateTimePickerService,
    DataGridService,
  ],
})
export class PeCouponsModule {}
