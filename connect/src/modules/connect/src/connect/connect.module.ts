import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { ClipboardModule } from 'ngx-clipboard';
import { EllipsisModule } from 'ngx-ellipsis';
import { InViewportModule } from 'ng-in-viewport';
import { SwiperModule } from 'ngx-swiper-wrapper';

import { AuthModule } from '@pe/auth';
import { MicroModule } from '@pe/common';
import { PeDataGridModule } from '@pe/data-grid';
import { AddressModule, FormModule, ThirdPartyFormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PeSidebarModule } from '@pe/sidebar';
import { PeFiltersModule } from '@pe/filters';
import { OverlayWidgetModule, PeOverlayWidgetService, PE_OVERLAY_COMPONENT, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SnackbarModule } from '@pe/snackbar';

import { ButtonModule, NavbarModule, OverlayBoxModule } from '../ngkit-modules';
import { ThirdPartyGeneratorModule } from '../ngkit-modules';

import { SharedModule } from '../shared';
import {
  MainLayoutComponent,
  ListLayoutComponent,
  ListCommonComponent,
  BackToMicroComponent,
  ConfigureThirdPartyComponent,
  ConfigureQrComponent,
  ConfigureDevicePaymentsComponent,
  InstallIntegrationComponent,
  IntegrationActionMenuComponent,
  IntegrationButtonComponent,
  IntegrationInstalledComponent,
  ListSpecificComponent,
  SmallCloseIconComponent,
  IntegrationFullPageComponent,
  IntegrationWriteReviewComponent,
  IntegrationAllReviewsComponent,
  IntegrationVersionHistoryComponent,
  IntegrationTitleComponent,
  IntegrationNewsComponent,
  IntegrationInformationComponent,
  IntegrationSupportedComponent,
  IntegrationMoreComponent,
  IntegrationRatingStarsComponent,
  IntegrationRatingsReviewsComponent,
  IntegrationRatingLinesComponent
} from './components';
import { ConnectRoutingModule } from './connect-routing.module';
import { IntegrationAppComponent } from './components/integration-app/integration-app.component';
import { CommunicationsModule } from '../communications';
import { PaymentsModule } from '../payments';
import { ShopsystemsModule } from '../shopsystems';
import { IntegrationRedirectGuard } from './guards';

(window as any)?.PayeverStatic?.IconLoader?.loadIcons([
  'set',
  'apps',
  'payment',
  'payment-methods',
  'payment-plugins',
  'dashboard',
  'notification',
  'shipping',
  'social'
]);

export const ConnectI18nModuleForChild = I18nModule.forChild();

@NgModule({
  imports: [
    CommonModule,
    ClipboardModule,
    EllipsisModule,
    PeDataGridModule,
    AuthModule,
    AddressModule,
    ConnectI18nModuleForChild,
    FormModule,
    FormsModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    ThirdPartyGeneratorModule,
    ThirdPartyFormModule,
    ButtonModule,
    MediaModule,
    MicroModule,
    NavbarModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatMenuModule,
    SharedModule,
    SwiperModule,
    MatDialogModule,
    InViewportModule,
    PeSidebarModule,
    PeFiltersModule,
    OverlayWidgetModule,
    SnackbarModule,

    PaymentsModule,
    ShopsystemsModule,
    CommunicationsModule,

    ConnectRoutingModule,
  ],
  declarations: [
    MainLayoutComponent,
    ListLayoutComponent,
    ListCommonComponent,
    BackToMicroComponent,
    ConfigureThirdPartyComponent,
    ConfigureQrComponent,
    ConfigureDevicePaymentsComponent,
    InstallIntegrationComponent,
    IntegrationButtonComponent,
    IntegrationInstalledComponent,
    ListSpecificComponent,
    SmallCloseIconComponent,
    IntegrationActionMenuComponent,
    IntegrationFullPageComponent,
    IntegrationTitleComponent,
    IntegrationAppComponent,
    IntegrationRatingStarsComponent,
    IntegrationNewsComponent,
    IntegrationInformationComponent,
    IntegrationSupportedComponent,
    IntegrationMoreComponent,
    IntegrationRatingsReviewsComponent,
    IntegrationRatingLinesComponent,
    IntegrationWriteReviewComponent,
    IntegrationAllReviewsComponent,
    IntegrationVersionHistoryComponent
  ],
  providers: [
    FormBuilder,
    IntegrationRedirectGuard,
    PeOverlayWidgetService,
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: PE_OVERLAY_COMPONENT,
      useClass: ConfigureThirdPartyComponent,
    },
  ],
  exports: [
    ConfigureThirdPartyComponent
  ]
})
export class ConnectModule {}
