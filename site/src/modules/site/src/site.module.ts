import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatIconModule } from '@angular/material/icon';

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
import { PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { ThirdPartyFormModule } from '@pe/forms';
import { SharedModule as ConnectAppSharedModule } from '@pe/connect-app';

import { PebSiteRouteModule } from './site.routing';
import { PebSiteComponent } from './routes/_root/site.component';
import { PebSiteDashboardComponent } from './routes/dashboard/site-dashboard.component';
import { PebSiteSettingsComponent } from './routes/settings/site-settings.component';
import { PebSiteGuard } from './guards/site.guard';
import { PebThemeGridComponent } from './routes/theme-grid/theme-grid.component';
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
  PeSiteMaterialComponent,
} from './components';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { pebSiteElementsConfig } from './site.config';
import { PebSiteBuilderInsertComponent } from './components/builder-insert/builder-insert.component';
import { PeSiteBuilderEditComponent } from './components/builder-edit/builder-edit.component';
import { PeQrPrintModule } from './components/qr-print/qr-print.module';


export const PebViewerModuleForRoot = PebViewerModule.withConfig(pebSiteElementsConfig);
export const i18n = I18nModule.forRoot();


@NgModule({
  imports: [
    PebButtonToggleModule,
    PebFormBackgroundModule,
    MatInputModule,
    PebFormFieldInputModule,
    PebExpandablePanelModule,
    PebMessagesModule,
    PebLogoPickerModule,
    MatFormFieldModule,
    MatIconModule,
    PebSocialSharingImageModule,
    FormsModule,
    ReactiveFormsModule,
    PebFormFieldTextareaModule,
    PebButtonModule,
    PebThemesModule,
    OverlayWidgetModule,
    PebSiteRouteModule,
    CommonModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    NgScrollbarModule,
    ClipboardModule,
    PeDataGridModule,
    MatSnackBarModule,
    PebViewerModuleForRoot,
    PeSidebarModule,
    i18n,
    PeQrPrintModule,
    ThirdPartyFormModule,
    ConnectAppSharedModule,
  ],
  providers: [
    PebSiteGuard,
    SnackbarService,
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
  ],
  declarations: [
    AbbreviationPipe,
    PeSiteMaterialComponent,
    PeSettingsFacebookPixelComponent,
    PeSettingsGoogleAnalyticsComponent,
    PebSiteComponent,
    PebSiteSettingsComponent,
    PebSiteDashboardComponent,
    PebThemeGridComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsConnectExistingComponent,
    PeSettingsCreateAppComponent,
    PeSettingsCustomerPrivacyComponent,
    PeSettingsPasswordProtectionComponent,
    PeSettingsPersonalDomainComponent,
    PeSettingsSocialImageComponent,
    PeSettingsSpamProtectionComponent,
    PebSiteBuilderInsertComponent,
    PeSiteBuilderEditComponent,
  ],
})
export class PebSiteModule {}
