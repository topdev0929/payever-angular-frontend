import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EnvironmentConfigGuard } from '../../kit/environment-config';
import { TranslationGuard } from '../../kit/i18n';
import {
  AddressDocComponent,
  AppContainerDocComponent,
  AppSwitcherExampleDocComponent,
  AuthTokenServiceDocComponent,
  BackDocComponent,
  BadgeSetDocComponent,
  BuilderDockerDocComponent,
  BuilderDockerItemDocComponent,
  BuilderDockerServiceDocComponent,
  BusinessServiceDocComponent,
  ButtonToggleDocComponent,
  CardDocComponent,
  CardsContainerDocComponent,
  CarouselDocComponent,
  CarouselServiceDocComponent,
  CheckboxDocComponent,
  ChooseRateDocComponent,
  ChooseRateAccordionDocComponent,
  ColorPickerDocComponent,
  ConfirmationDialogDirectiveDocComponent,
  ConfirmationDialogDocComponent,
  ConfirmationDialogServiceDocComponent,
  CounterDocComponent,
  CustomElementWrapperDocComponent,
  DashboardDocComponent,
  DashboardMenuDocComponent,
  DataGridDocComponent,
  DatepickerDocComponent,
  DevModeServiceDocsComponent,
  DevModeServiceStubDocsComponent,
  DialogDocComponent,
  DividerDocComponent,
  DockerDocComponent,
  DockerPosDocComponent,
  DockerPosItemDocComponent,
  DockerStoreDocComponent,
  DockerStoreItemDocComponent,
  DocLocationServiceComponent,
  DocLocationServiceStubComponent,
  DocTopLocationServiceComponent,
  DocTopLocationServiceStubComponent,
  ErrorDocComponent,
  EventBusServiceDocComponent,
  FeedbackDocComponent,
  FilterDocComponent,
  FormAbstractDocComponent,
  FormAddonDocComponent,
  FormDocComponent,
  FormFieldsetDocComponent,
  FullStoryServiceDocComponent,
  GeneralDashboardDocComponent,
  GoogleAutocompleteDirectiveDocComponent,
  GoogleAutocompleteServiceDocComponent,
  I18nDocComponent,
  IconsDocComponent,
  ImageSliderDocComponent,
  InputDocComponent,
  LayoutAppDocComponent,
  LayoutContentDocComponent,
  LayoutDocComponent,
  LayoutServiceDocComponent,
  LayoutTabsetDocComponent,
  ListDocComponent,
  LoaderManagerServiceDocComponent,
  LocalStorageServiceDocComponent,
  MenuDocComponent,
  MicroAddonDocComponent,
  ModalDocComponent,
  ModalsComponent,
  NavbarDocComponent,
  NotificationDocComponent,
  NotificationItemDocComponent,
  NotificationWrapperDocComponent,
  Notify2DocComponent,
  NotifyDocComponent,
  OverlayBoxDocComponent,
  ParagraphEditorDocComponent,
  PasscodeDocComponent,
  PasscodeServiceDocComponent,
  PaymentOptionDocComponent,
  PaymentOptionsListDocComponent,
  PhoneInputDocComponent,
  PlatformServiceDocComponent,
  PriceDocComponent,
  ProfileContainerDocComponent,
  ProfileServiceDocComponent,
  ProfileSwitcherDocComponent,
  ProgressbarsDocComponent,
  ProgressButtonDocComponent,
  RadioDocComponent,
  RateDocComponent,
  RateLoadingDocComponent,
  RateSimpleDocComponent,
  ReadMoreDirectiveDocComponent,
  ReCaptchaDocComponent,
  RouterModalDocComponent,
  RouterModalServiceDocComponent,
  ScrollEndDetectionDirectiveDocComponent,
  SearchDocComponent,
  SearchResultsDocComponent,
  SelectDocComponent,
  SessionStorageServiceDocComponent,
  ShortcutsDocComponent,
  SidebarDocComponent,
  SidebarLayoutDocComponent,
  SidenavDocComponent,
  SkinWidgetDocComponent,
  SliderDocComponent,
  SlideToggleDocComponent,
  SnackBarDocComponent,
  SpinnerDocComponent,
  StoreSliderDocComponent,
  StoreSliderServiceDocComponent,
  SubdashboardHeaderDocComponent,
  TableDocComponent,
  TabsSidenavDocComponent,
  TerminalListDocComponent,
  TestDocsFakeOverlayContainerComponent,
  TestDocsImageUrlBase64FixtureComponent,
  TestDocsNonRecompilableTestModuleHelperComponent,
  TestDocsNoopComponentComponent,
  TestDocsOverrideChangeDetectionStrategyHelperComponent,
  ThemeCardDocComponent,
  ThemeSwitcherDocComponent,
  ThirdPartyGeneratorDocComponent,
  TooltipDocComponent,
  TreeDocComponent,
  WelcomeScreenDocComponent,
  WindowServiceDocComponent, TextEditorDocComponent
} from './generated';
import { ComponentsComponent } from './components.component';
import { ToastDocComponent } from './generated/toast/toast-doc.component';

const appRoutes: Routes = [
  {
    path: '',
    canActivate: [ EnvironmentConfigGuard, TranslationGuard ],
    data: {
      i18nDomains: ['ng-kit-ng-kit'],
    },
    component: ComponentsComponent,
    children: [
      {
        path: 'components',
        children: [
          // Material stuff doc routes
          {
            path: 'mat-button-toggle',
            component: ButtonToggleDocComponent
          },
          {
            path: 'mat-checkbox',
            component: CheckboxDocComponent
          },
          {
            path: 'mat-datepicker',
            component: DatepickerDocComponent
          },
          {
            path: 'mat-input',
            component: InputDocComponent
          },
          {
            path: 'mat-radio',
            component: RadioDocComponent
          },
          {
            path: 'mat-tree',
            component: TreeDocComponent
          },
          {
            path: 'mat-select',
            component: SelectDocComponent
          },
          {
            path: 'mat-sidenav',
            component: SidenavDocComponent
          },
          {
            path: 'mat-tabs',
            component: TabsSidenavDocComponent
          },
          {
            path: 'mat-phone-input',
            component: PhoneInputDocComponent
          },
          {
            path: 'mat-slide-toggle',
            component: SlideToggleDocComponent
          },
          {
            path: 'mat-slider',
            component: SliderDocComponent
          },
          {
            path: 'mat-tooltip',
            component: TooltipDocComponent
          },
          {
            path: 'mat-fieldset',
            component: FormFieldsetDocComponent
          },
          {
            path: 'mat-divider',
            component: DividerDocComponent
          },
          // Own stuff doc routes
          {
            path: 'toast',
            component: ToastDocComponent
          },
          {
            path: 'address-service',
            component: AddressDocComponent
          },
          {
            path: 'google-autocomplete-service',
            component: GoogleAutocompleteServiceDocComponent
          },
          {
            path: 'google-autocomplete-directive',
            component: GoogleAutocompleteDirectiveDocComponent
          },
          {
            path: 'app-container',
            component: AppContainerDocComponent
          },
          {
            path: 'badge-set',
            component: BadgeSetDocComponent
          },
          {
            path: 'builder-docker',
            component: BuilderDockerDocComponent
          },
          {
            path: 'builder-docker-item',
            component: BuilderDockerItemDocComponent
          },
          {
            path: 'builder-docker-service',
            component: BuilderDockerServiceDocComponent
          },
          {
            path: 'business-service',
            component: BusinessServiceDocComponent
          },
          {
            path: 'button',
            children: [
              {
                path: 'progress-buttons',
                component: ProgressButtonDocComponent
              }
            ]
          },
          {
            path: 'card',
            component: CardDocComponent
          },
          {
            path: 'cards-container',
            component: CardsContainerDocComponent
          },
          {
            path: 'carousel',
            component: CarouselDocComponent
          },
          {
            path: 'carousel-service',
            component: CarouselServiceDocComponent
          },
          {
            path: 'color-picker',
            component: ColorPickerDocComponent
          },
          {
            path: 'auth-token-service',
            component: AuthTokenServiceDocComponent
          },
          {
            path: 'event-bus-service',
            component: EventBusServiceDocComponent
          },
          {
            path: 'loader-manager-service',
            component: LoaderManagerServiceDocComponent
          },
          {
            path: 'platform-service',
            component: PlatformServiceDocComponent
          },
          {
            path: 'counter',
            component: CounterDocComponent
          },
          {
            path: 'custom-element-wrapper',
            component: CustomElementWrapperDocComponent
          },
          {
            path: 'dashboard',
            component: DashboardDocComponent
          },
          {
            path: 'dashboard-menu',
            component: DashboardMenuDocComponent
          },
          {
            path: 'data-grid',
            component: DataGridDocComponent
          },
          {
            path: 'dialog',
            component: DialogDocComponent
          },
          {
            path: 'docker',
            component: DockerDocComponent
          },
          {
            path: 'docker-pos',
            component: DockerPosDocComponent
          },
          {
            path: 'docker-pos-item',
            component: DockerPosItemDocComponent
          },
          {
            path: 'docker-store',
            component: DockerStoreDocComponent
          },
          {
            path: 'docker-store-item',
            component: DockerStoreItemDocComponent
          },
          {
            path: 'text-editor',
            component: TextEditorDocComponent
          },
          {
            path: 'error',
            component: ErrorDocComponent
          },
          {
            path: 'feedback',
            component: FeedbackDocComponent
          },
          {
            path: 'filter',
            component: FilterDocComponent
          },
          {
            path: 'form',
            component: FormDocComponent
          },
          {
            path: 'form-fieldset',
            component: FormFieldsetDocComponent
          },
          {
            path: 'form-addon',
            component: FormAddonDocComponent
          },
          {
            path: 'form-abstract',
            component: FormAbstractDocComponent
          },
          {
            path: 'full-story-service',
            component: FullStoryServiceDocComponent
          },
          {
            path: 'general-dashboard',
            component: GeneralDashboardDocComponent
          },
          {
            path: 'i18n',
            component: I18nDocComponent
          },
          {
            path: 'icons',
            component: IconsDocComponent
          },
          {
            path: 'image-slider',
            component: ImageSliderDocComponent
          },
          {
            path: 'layout',
            component: LayoutDocComponent
          },
          {
            path: 'layout-app',
            component: LayoutAppDocComponent
          },
          {
            path: 'layout-content',
            component: LayoutContentDocComponent
          },
          {
            path: 'layout-service',
            component: LayoutServiceDocComponent
          },
          {
            path: 'list',
            component: ListDocComponent
          },
          {
            path: 'snack-bar',
            component: SnackBarDocComponent
          },
          {
            path: 'spinner',
            component: SpinnerDocComponent
          },
          {
            path: 'back',
            component: BackDocComponent
          },
          {
            path: 'layout-tabset',
            component: LayoutTabsetDocComponent,
            children: [
              {
                path: 'layout-content',
                component: LayoutContentDocComponent
              }
            ]
          },
          {
            path: 'local-storage-service',
            component: LocalStorageServiceDocComponent,
          },
          {
            path: 'menu',
            component: MenuDocComponent
          },
          {
            path: 'modals',
            component: ModalsComponent
          },
          {
            path: 'modal',
            component: ModalDocComponent
          },
          {
            path: 'confirmation-dialog',
            component: ConfirmationDialogDocComponent
          },
          {
            path: 'confirmation-dialog-directive',
            component: ConfirmationDialogDirectiveDocComponent
          },
          {
            path: 'confirmation-dialog-service',
            component: ConfirmationDialogServiceDocComponent
          },
          {
            path: 'router-modal-service',
            component: RouterModalServiceDocComponent
          },
          {
            path: 'router-modal',
            component: RouterModalDocComponent
          },
          {
            path: 'micro-addon',
            component: MicroAddonDocComponent
          },
          {
            path: 'notification',
            component: NotificationDocComponent
          },
          {
            path: 'notification-item',
            component: NotificationItemDocComponent
          },
          {
            path: 'navbar',
            component: NavbarDocComponent
          },
          {
            path: 'notification-wrapper',
            component: NotificationWrapperDocComponent
          },
          {
            path: 'notify',
            component: NotifyDocComponent
          },
          {
            path: 'notify2',
            component: Notify2DocComponent
          },
          {
            path: 'overlay-box',
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: './overlay-box-module'
              },
              {
                path: 'overlay-box-module',
                component: OverlayBoxDocComponent
              },
              {
                path: 'subdashboard-header',
                component: SubdashboardHeaderDocComponent
              }
            ]
          },
          {
            path: 'paragraph-editor',
            component: ParagraphEditorDocComponent
          },
          {
            path: 'passcode',
            component: PasscodeDocComponent
          },
          {
            path: 'passcode-service',
            component: PasscodeServiceDocComponent
          },
          {
            path: 'payment-option',
            component: PaymentOptionDocComponent
          },
          {
            path: 'payment-option-list',
            component: PaymentOptionsListDocComponent
          },
          {
            path: 'price',
            component: PriceDocComponent
          },
          {
            path: 'profile-service',
            component: ProfileServiceDocComponent
          },
          {
            path: 'profile-container',
            component: ProfileContainerDocComponent
          },
          {
            path: 'profile-switcher',
            component: ProfileSwitcherDocComponent
          },
          {
            path: 'app-switcher',
            component: AppSwitcherExampleDocComponent
          },
          {
            path: 'progressbar',
            component: ProgressbarsDocComponent
          },
          {
            path: 'rate',
            component: RateDocComponent
          },
          {
            path: 'choose-rate',
            component: ChooseRateDocComponent
          },
          {
            path: 'choose-rate-accordion',
            component: ChooseRateAccordionDocComponent
          },
          {
            path: 'rate-simple',
            component: RateSimpleDocComponent
          },
          {
            path: 'rate-loading',
            component: RateLoadingDocComponent
          },
          {
            path: 'read-more-directive',
            component: ReadMoreDirectiveDocComponent
          },
          {
            path: 'scroll-end-detection',
            component: ScrollEndDetectionDirectiveDocComponent
          },
          {
            path: 'recaptcha',
            component: ReCaptchaDocComponent
          },
          {
            path: 'search',
            component: SearchDocComponent
          },
          {
            path: 'search-results',
            component: SearchResultsDocComponent
          },
          {
            path: 'session-storage-service',
            component: SessionStorageServiceDocComponent
          },
          {
            path: 'shortcuts',
            component: ShortcutsDocComponent
          },
          {
            path: 'sidebar',
            component: SidebarDocComponent
          },
          {
            path: 'sidebar-layout',
            component: SidebarLayoutDocComponent
          },
          {
            path: 'skin-widgets',
            component: SkinWidgetDocComponent
          },
          {
            path: 'store-slider',
            component: StoreSliderDocComponent
          },
          {
            path: 'store-slider-service',
            component: StoreSliderServiceDocComponent
          },
          {
            path: 'mat-table',
            component: TableDocComponent
          },
          {
            path: 'terminal-list',
            component: TerminalListDocComponent
          },
          {
            path: 'theme-card',
            component: ThemeCardDocComponent
          },
          {
            path: 'theme-switcher',
            component: ThemeSwitcherDocComponent
          },
          {
            path: 'third-party-generator',
            component: ThirdPartyGeneratorDocComponent
          },
          {
            path: 'welcome-screen',
            component: WelcomeScreenDocComponent
          },
          {
            path: 'window-service',
            component: WindowServiceDocComponent
          },
        ],
      },
      {
        path: 'modules',
        children: [
          {
            path: 'dev',
            children: [
              {
                path: 'dev-mode-service',
                component: DevModeServiceDocsComponent,
              },
              {
                path: 'dev-mode-service-stub',
                component: DevModeServiceStubDocsComponent,
              },
            ],
          },
          {
            path: 'location',
            children: [
              {
                path: 'location-service',
                component: DocLocationServiceComponent,
              },
              {
                path: 'location-service-stub',
                component: DocLocationServiceStubComponent,
              },
              {
                path: 'top-location-service',
                component: DocTopLocationServiceComponent,
              },
              {
                path: 'top-location-service-stub',
                component: DocTopLocationServiceStubComponent,
              },
            ]
          },
          {
            path: 'test',
            children: [
              {
                path: 'non-recompilable-test-module-helper',
                component: TestDocsNonRecompilableTestModuleHelperComponent
              },
              {
                path: 'override-change-detection-strategy-helper',
                component: TestDocsOverrideChangeDetectionStrategyHelperComponent,
              },
              {
                path: 'fake-overlay-container',
                component: TestDocsFakeOverlayContainerComponent,
              },
              {
                path: 'noop-component',
                component: TestDocsNoopComponentComponent,
              },
              {
                path: 'image-url-base64-fixture',
                component: TestDocsImageUrlBase64FixtureComponent,
              }
            ]
          },
        ],
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: true})
  ],
  exports: [
    RouterModule
  ]
})
export class ComponentsRoutingModule {
}
