import { ComponentFactory, ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

import { InViewportModule } from 'ng-in-viewport';
import { MomentModule } from 'angular2-moment';

import { AuthModule } from '@pe/auth';
import { PeDataGridModule } from '@pe/data-grid';
import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { PeSimpleStepperModule } from '@pe/stepper';
import { SnackbarModule } from '@pe/snackbar';

import { ButtonModule } from '../ngkit-modules/button';
import { NavbarModule } from '../ngkit-modules/navbar';
import { OverlayBoxModule } from '../ngkit-modules/overlay-box';

import { BusinessService, DataGridService, IntegrationsApiService, IntegrationsStateService, NavigationService, UninstallService } from './services';
import { httpInterceptorProviders } from './http-interceptors';
import {
  InstallPaymentsListComponent,
  EmbedListCommonComponent,
  EmbedOpenIntegrationComponent,
  IntegrationCardComponent,
  OnboardingFormComponent,
  PeConnectTreeFilterIconComponent,
  PluginApiKeysComponent,
  PluginApiKeysListComponent,
  PluginApiKeyAddComponent,
  ConnectWelcomeComponent,
  ACCOUNT_PROVIDERS
} from './components';
import { PaymentsApiService, PaymentsStateService, KeysApiService, KeysStateService } from './services';

export function IntegrationsStateServiceFactory(bs: BusinessService, is: IntegrationsApiService) {
  if (!window['pe_ConnectAppIntegrationsStateService']) {
    window['pe_ConnectAppIntegrationsStateService'] = new IntegrationsStateService(bs, is);
  }
  return window['pe_ConnectAppIntegrationsStateService'];
}

export function PaymentsStateServiceFactory(injector: Injector) {
  if (!window['pe_ConnectAppPaymentsStateService']) {
    window['pe_ConnectAppPaymentsStateService'] = new PaymentsStateService(injector);
  }
  return window['pe_ConnectAppPaymentsStateService'];
}

export function KeysStateServiceFactory(injector: Injector) {
  if (!window['pe_ConnectAppKeysStateService']) {
    window['pe_ConnectAppKeysStateService'] = new KeysStateService(injector);
  }
  return window['pe_ConnectAppKeysStateService'];
}

@NgModule({
  imports: [
    FormModule,
    NavbarModule,
    AuthModule,
    PeDataGridModule,
    HttpClientModule,

    CommonModule,
    ButtonModule,
    OverlayBoxModule,
    I18nModule,
    PeSimpleStepperModule,
    SnackbarModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
    InViewportModule,
    MomentModule
  ],
  exports: [
    HttpClientModule,
    InstallPaymentsListComponent,
    EmbedListCommonComponent,
    EmbedOpenIntegrationComponent,
    OnboardingFormComponent,
    IntegrationCardComponent,
    PeConnectTreeFilterIconComponent,
    PluginApiKeysComponent,
    PluginApiKeysListComponent,
    PluginApiKeyAddComponent,
  ],
  declarations: [
    ConnectWelcomeComponent,
    InstallPaymentsListComponent,
    EmbedListCommonComponent,
    EmbedOpenIntegrationComponent,
    OnboardingFormComponent,
    IntegrationCardComponent,
    PeConnectTreeFilterIconComponent,
    PluginApiKeysComponent,
    PluginApiKeysListComponent,
    PluginApiKeyAddComponent,
  ],
  providers: [
    BusinessService,
    DataGridService,
    NavigationService,
    IntegrationsApiService,
    UninstallService,
    {
      provide: IntegrationsStateService, useFactory: IntegrationsStateServiceFactory,
      deps: [ BusinessService, IntegrationsApiService ]
    },
    PaymentsApiService,
    {
      provide: PaymentsStateService, useFactory: PaymentsStateServiceFactory,
      deps: [ Injector ]
    },
    KeysApiService,
    {
      provide: KeysStateService, useFactory: KeysStateServiceFactory,
      deps: [ Injector ]
    },
    ...ACCOUNT_PROVIDERS,
    ...httpInterceptorProviders
  ]
})
export class SharedModule {
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  public resolveInstallPaymentsListComponent(): ComponentFactory<InstallPaymentsListComponent> {
    return this.componentFactoryResolver.resolveComponentFactory(InstallPaymentsListComponent);
  }
}
