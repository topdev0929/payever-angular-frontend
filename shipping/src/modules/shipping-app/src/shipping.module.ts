import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PeDataGridModule } from '@pe/data-grid';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PebRadioModule,
  PebSelectModule,
  PebProductPickerModule, PePickerModule,
} from '@pe/ui';
import { MatMenuModule } from '@angular/material/menu';

import { CountryPipe } from './pipes/country.pipe';
import { PebConnectComponent } from './routes/connect/connect.component';
import { PebDeliveryByLocationComponent } from './routes/delivery-by-location/delivery-by-location.component';
import { LibShippingEditLocationModalComponent } from './routes/delivery-by-location/edit-location-modal/edit-location-modal.component';
import { PebPackagingSlipComponent } from './routes/packaging-slip/packaging-slip.component';
import { PebPickupByLocationComponent } from './routes/pickup-by-location/pickup-by-location.component';
import { PebShippingComponent } from './routes/root/shipping.component';
import { PebShippingEditOptionsComponent } from './routes/shipping-options/edit-options-modal/edit-options.component';
import { PebShippingFormComponent } from './routes/shipping-options/free-option-modal/free-shipping-form.component';
import { PebShippingOptionsComponent } from './routes/shipping-options/shipping-options.component';
import { PebBoxesComponent } from './routes/shipping-packages/boxes/boxes.component';
import { PebEnvelopesComponent } from './routes/shipping-packages/envelopes/envelopes.component';
import { PebNewPackageComponent } from './routes/shipping-packages/envelopes/new-package-modal/new-package.component';
import { PebShippingPackagesComponent } from './routes/shipping-packages/shipping-packages.component';
import { PebSoftPackageComponent } from './routes/shipping-packages/soft-package/soft-package.component';
import { PebBrowseProductsFormComponent } from './routes/shipping-profiles/browse-products/browse-products.component';
import { PebShippingProfileFormComponent } from './routes/shipping-profiles/profiles-dialog/profiles-dialog.component';
import { PebShippingProfilesComponent } from './routes/shipping-profiles/shipping-profiles.component';
import { ShippingHeaderService } from './services/shipping-header.service';
import { PebShippingRouteModule } from './shipping.routing';
import { CountriesPipe } from './pipes/countries.pipe';
import { I18nModule } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { DialogDataExampleDialogComponent } from './routes/shipping-profiles/browse-products/dialogs/dialog-data.component';
import { ConfirmDialogService } from './routes/shipping-profiles/browse-products/dialogs/dialog-data.service';
import { CurrencySymbolPipe } from './pipes/currency.pipe';
import { ApolloModule } from 'apollo-angular';
import { MatDialogModule } from '@angular/material/dialog';
import { ChannelTypeIconService } from './routes/shipping-profiles/browse-products/services/channel-type-icon.service';
import { ApolloConfigModule } from './apollo.module';
import { AuthModule } from '@pe/auth';
import { PeFiltersModule } from '@pe/filters';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { PebShippingContextMenuComponent } from './routes/shipping-profiles/context-menu/context-menu.component';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { SharedModule } from '@pe/connect-app';

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const i18n = I18nModule.forRoot();
export const PeAuthModuleForRoot = AuthModule.forRoot();
export const MediaModuleForRoot = MediaModule.forRoot({});

const uicomp = [
  PebButtonModule,
  PebCheckboxModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebSelectModule,
  PebRadioModule,
  PebFormBackgroundModule,
  PebExpandablePanelModule,
  PebButtonToggleModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebMessagesModule,
  PebProductPickerModule,
];

(window as any)?.PayeverStatic.IconLoader.loadIcons([
  'flags',
]);

@NgModule({
  declarations: [
    PebShippingComponent,
    PebShippingOptionsComponent,
    PebShippingPackagesComponent,
    PebDeliveryByLocationComponent,
    PebPickupByLocationComponent,
    PebPackagingSlipComponent,
    PebConnectComponent,
    LibShippingEditLocationModalComponent,
    PebShippingFormComponent,
    PebShippingEditOptionsComponent,
    PebEnvelopesComponent,
    PebBoxesComponent,
    PebNewPackageComponent,
    PebSoftPackageComponent,
    CountryPipe,
    PebShippingProfilesComponent,
    PebShippingProfileFormComponent,
    PebBrowseProductsFormComponent,
    CountriesPipe,
    CurrencySymbolPipe,
    DialogDataExampleDialogComponent,
    PebShippingContextMenuComponent,
  ],
  imports: [
    CommonModule,
    PebShippingRouteModule,
    PeDataGridModule,
    PeSidebarModule,
    MatMomentDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    PePlatformHeaderModule,
    MatIconModule,
    SharedModule,
    ...uicomp,
    i18n,
    MediaModuleForRoot,
    PeAuthModuleForRoot,
    ApolloModule,
    ApolloConfigModule,
    MatMenuModule,
    MatDialogModule,
    PeFiltersModule,
    PePickerModule,
    MatGoogleMapsAutocompleteModule,
  ],
  providers: [ShippingHeaderService, ChannelTypeIconService, ConfirmDialogService, MediaUrlPipe, PeOverlayWidgetService],
})
export class PebShippingModule {}
