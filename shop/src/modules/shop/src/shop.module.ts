import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { PebViewerModule } from '@pe/builder-viewer';
import { PeSidebarModule } from '@pe/sidebar';
import { PeDataGridModule } from '@pe/data-grid';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PebThemesModule } from '@pe/themes';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSocialSharingImageModule,
} from '@pe/ui';
import { I18nModule } from '@pe/i18n';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { ThirdPartyFormModule } from '@pe/forms';
import { SharedModule as ConnectAppSharedModule } from '@pe/connect-app';

import { PebShopRouteModule } from './shop.routing';
import { PebShopComponent } from './routes/_root/shop-root.component';
import { pebShopElementsConfig } from './shop.config';
import { PebShopDashboardComponent } from './routes/dashboard/shop-dashboard.component';
import { PebShopSettingsComponent } from './routes/settings/shop-settings.component';
import { PebShopGuard } from './guards/shop.guard';
import { PebShopThemesComponent } from './routes/themes/shop-themes.component';
import {
  PeSettingsConnectExistingComponent,
  PeSettingsCreateAppComponent,
  PeSettingsCustomerPrivacyComponent,
  PeSettingsFacebookPixelComponent,
  PeSettingsGoogleAnalyticsComponent,
  PeSettingsPasswordProtectionComponent,
  PeSettingsPayeverDomainComponent,
  PeSettingsPersonalDomainComponent,
  PeSettingsSocialImageComponent,
  PeSettingsSpamProtectionComponent,
} from './components';
import { PeShopMaterialComponent } from './components/material/material.component';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PeQrPrintModule } from './components/qr-print/qr-print.module';


// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebViewerModuleForRoot = PebViewerModule.withConfig(pebShopElementsConfig);
export const i18n = I18nModule.forRoot();


@NgModule({
  imports: [
    ClipboardModule,
    PebSocialSharingImageModule,
    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PebButtonModule,
    PebLogoPickerModule,
    PebShopRouteModule,
    OverlayWidgetModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PebThemesModule,
    pebViewerModuleForRoot,
    NgScrollbarModule,
    MatFormFieldModule,
    MatInputModule,
    PeSidebarModule,
    PeDataGridModule,
    MatSlideToggleModule,
    OverlayWidgetModule,
    PebShopEditorModule,
    i18n,
    PeQrPrintModule,
    ThirdPartyFormModule,
    ConnectAppSharedModule,
  ],
  declarations: [
    PebShopThemesComponent,
    PeShopMaterialComponent,
    PebShopComponent,
    PebShopDashboardComponent,
    PebShopSettingsComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsConnectExistingComponent,
    PeSettingsCreateAppComponent,
    PeSettingsCustomerPrivacyComponent,
    PeSettingsFacebookPixelComponent,
    PeSettingsGoogleAnalyticsComponent,
    PeSettingsPasswordProtectionComponent,
    PeSettingsPersonalDomainComponent,
    PeSettingsSocialImageComponent,
    PeSettingsSpamProtectionComponent,
    AbbreviationPipe,
  ],
  providers: [
    PebShopGuard,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
  ],
})
export class PebShopModule { }
