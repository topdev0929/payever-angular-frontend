import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injector } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from 'ngx-clipboard';

// TODO Return back
// import { PaymentsModule } from '@pe/connect-sdk/sdk/payments';

import { PeSimpleStepperModule } from '@pe/stepper';
import { AuthModule } from '@pe/auth';
import { MediaModule } from '@pe/media';
import { MicroModule } from '@pe/common';
import { AppSwitcherModule } from '@pe/app-switcher';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { I18nModule } from '@pe/i18n';
import { SharedModule } from '@pe/connect-app';
import { PeSidebarModule } from '@pe/sidebar';
import { PeFiltersModule } from '@pe/filters';
import { PebColorPickerFormModule, PebFormFieldInputModule, PebLogoPickerModule, PebSelectModule } from '@pe/ui';
import { PeDataGridModule, PeDataGridSidebarService } from '@pe/data-grid';
import { OverlayWidgetModule, PeOverlayWidgetService, PE_OVERLAY_COMPONENT, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import {
  FormComponentsColorPickerModule,
  FormComponentsInputModule,
  FormModule,
  SnackBarModule,
  ThirdPartyFormModule
} from '@pe/forms';

import { CheckoutRoutingModule } from './checkout-routing.module';

import { NavbarModule, ButtonModule, OverlayBoxModule } from './shared';

import {
  CheckoutFullModalComponent,
  ColorAndStyleComponent,
  ConfirmationModalComponent,
  ConnectAppAddComponent,
  ConnectAppEditComponent,
  CreateCheckoutComponent,
  CspComponent,
  LanguageComponent,
  PoliciesComponent,
  NotificationsComponent,
  SectionsModalComponent,
  TestingModeComponent,
  CheckoutWrapperDirectLinkComponent,
  WelcomeDetailsComponent,
  WelcomePaymentsComponent,
  CheckoutLayoutComponent,
  EditSettingsComponent,
  LayoutComponent,
  QRIntegrationComponent,
  CheckoutClipboardCopyComponent,
  RootCheckoutWrapperComponent,
  ThirdPartyComponent,
  SwitcherComponent,
  CreateCheckoutFormComponent,

  PanelCheckoutComponent,
  PanelPaymentOptionsComponent,
  PanelChannelsComponent,
  PanelConnectComponent,
  PanelSectionsComponent,
  PanelSettingsComponent,
  StoreAppComponent,
  PosAppComponent,
  QRAppComponent,
  MarketingAppComponent,
  CronIntervalSettingsComponent,
  WarningModalComponent
} from './components';
import { PlatformHeaderLoaderGuard } from './guards';
import {
  CheckoutResolver,
  CurrentCheckoutResolver,
  CurrentCheckoutModalResolver,
  ChannelWidgetDataResolver,
  LoadingResolver,
  ResetCacheResolver
} from './resolvers';
import { FirstCheckoutGuard, PhoneNumbersResolver } from './services';
import { ApiService, EnvService, StorageService, HeaderService, RootCheckoutWrapperService, UploaderService } from './services';
import { FinexpApiAbstractService, FinexpStorageAbstractService, FinexpHeaderAbstractService, CheckoutModalModule } from '@pe/finexp-app';
import {
  ExpansionConnMenuListComponent,
  ExpansionMenuListComponent,
  MenuListComponent
} from './containers';
import { OldCreateCheckoutFormComponent } from './components/deprecated/create-checkout-form/create-checkout-form.component';

(window as any).PayeverStatic?.IconLoader?.loadIcons([
  'apps',
  'banners',
  'builder',
  'dashboard',
  'edit-panel',
  'finance-express',
  'notification',
  'payment-methods', // For welcome stepper payments
  'payment-plugins', // Same
  'settings',
  'set',
]);
(window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
  // TODO Load on integration open
  'channel-whatsapp',
  'channel-instagram',
  'channel-fb-messenger',
  'channel-fb'
]);

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const I18nModuleForChild = I18nModule.forChild();
export const MediaModuleForRoot = MediaModule.forRoot();

export function StorageServiceFactory(injector: Injector): any {
  if (!window['pe_Checkout_StorageService']) {
    window['pe_Checkout_StorageService'] = new StorageService(injector);
  }
  return window['pe_Checkout_StorageService'];
}

const modals = [
  CspComponent,
  EditSettingsComponent,
  ColorAndStyleComponent,
  LanguageComponent,
  PoliciesComponent,
  NotificationsComponent,
  CreateCheckoutFormComponent,
  CronIntervalSettingsComponent,
  WarningModalComponent
];

@NgModule({
  imports: [
    AuthModule,
    CommonModule,
    RouterModule,
    CheckoutRoutingModule,
    ClipboardModule,
    // PaymentsModule,  //TODO Return back
    PeSimpleStepperModule,
    FormModule,
    I18nModuleForChild,
    PePlatformHeaderModule,
    MediaModuleForRoot,
    MatButtonModule,
    MatCardModule,
    DragDropModule,
    MatCheckboxModule,
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,
    OverlayModule,
    PortalModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    MicroModule,
    ThirdPartyFormModule,
    AppSwitcherModule,
    SnackBarModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormComponentsColorPickerModule,
    FormComponentsInputModule,

    PeSidebarModule,
    PeFiltersModule,
    PebSelectModule,
    PebFormFieldInputModule,
    ButtonModule,
    NavbarModule,
    OverlayBoxModule,
    SharedModule,
    PeDataGridModule,
    CheckoutModalModule,
    PebLogoPickerModule,

    OverlayWidgetModule,
    PebColorPickerFormModule
  ],
  declarations: [
    CheckoutWrapperDirectLinkComponent,
    WelcomeDetailsComponent,
    WelcomePaymentsComponent,
    CheckoutLayoutComponent,
    LayoutComponent,
    QRIntegrationComponent,
    CheckoutClipboardCopyComponent,
    RootCheckoutWrapperComponent,
    CheckoutFullModalComponent,
    ColorAndStyleComponent,
    ConfirmationModalComponent,
    ConnectAppAddComponent,
    ConnectAppEditComponent,
    CreateCheckoutComponent,
    CreateCheckoutFormComponent,
    OldCreateCheckoutFormComponent,
    EditSettingsComponent,
    ExpansionMenuListComponent,
    ExpansionConnMenuListComponent,
    MenuListComponent,
    SwitcherComponent,
    CspComponent,
    LanguageComponent,
    PoliciesComponent,
    NotificationsComponent,
    SectionsModalComponent,
    TestingModeComponent,
    ThirdPartyComponent,
    ExpansionMenuListComponent,
    ExpansionConnMenuListComponent,
    MenuListComponent,
    WarningModalComponent,

    StoreAppComponent,
    PosAppComponent,
    QRAppComponent,
    MarketingAppComponent,

    PanelCheckoutComponent,
    PanelPaymentOptionsComponent,
    PanelChannelsComponent,
    PanelConnectComponent,
    PanelSectionsComponent,
    PanelSettingsComponent,
    CronIntervalSettingsComponent
  ],
  providers: [
    FirstCheckoutGuard,
    PhoneNumbersResolver,
    CheckoutResolver,

    ApiService,
    EnvService,
    StorageService,
    HeaderService,
    RootCheckoutWrapperService,
    UploaderService,
    PeDataGridSidebarService,

    CurrentCheckoutResolver,
    ChannelWidgetDataResolver,
    CurrentCheckoutModalResolver,
    LoadingResolver,
    ResetCacheResolver,
    PlatformHeaderLoaderGuard,
    PeOverlayWidgetService,
    {
      provide: FinexpApiAbstractService,
      useClass: ApiService
    },
    {
      provide: FinexpStorageAbstractService,
      useFactory: StorageServiceFactory,
      deps: [Injector]
    },
    {
      provide: StorageService,
      useFactory: StorageServiceFactory,
      deps: [Injector]
    },
    {
      provide: FinexpHeaderAbstractService,
      useClass: HeaderService
    },
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: PE_OVERLAY_COMPONENT,
      useClass: CreateCheckoutComponent,
    },
  ],
  entryComponents: [
    ...modals
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // For 'pe-checkout-wrapper-by-channel-set-id'
})
export class CheckoutModule {
}
