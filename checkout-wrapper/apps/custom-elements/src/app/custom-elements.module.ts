import { APP_BASE_HREF } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule as AnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsModule } from '@ngxs/store';

import { RefreshTokenGuard } from '@pe/auth';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { ErrorHandlerModule } from '@pe/checkout/main/error-handler';
import { StorageService } from '@pe/checkout/storage';
import { StoreModule } from '@pe/checkout/store';
import { UtilsModule } from '@pe/checkout/utils';

import { CosEnvProviders } from '../../../environments/env.provider';
import { environment } from '../../../environments/environment';
import { customLocale, dayJsLocale } from '../../../environments/locales';

import { appVersionFactory } from './app-version.token';
import {
  CheckoutWidgetModule,
  PeCheckoutWidgetComponent,
} from './checkout-widget';
import {
  CheckoutWrapperByChannelSetIdModule,
  PeCheckoutWrapperByChannelSetIdComponent,
} from './checkout-wrapper-by-channel-set-id';
import {
  CheckoutWrapperByChannelSetIdFinExpModule,
  PeCheckoutWrapperByChannelSetIdFinExpComponent,
} from './checkout-wrapper-by-channel-set-id-finexp';
import {
  CheckoutWrapperEditTransactionModule,
  PeCheckoutWrapperEditTransactionComponent,
} from './checkout-wrapper-edit-transaction';
import { CeAuthState } from './shared';

@NgModule({
  imports: [
    BrowserModule,
    AnimationsModule,
    HttpClientModule,
    HttpClientJsonpModule,

    UtilsModule,
    RouterModule.forRoot([]),
    ErrorHandlerModule,

    NgxsModule.forFeature([CeAuthState]),
    NgxsSelectSnapshotModule.forRoot(),
    StoreModule,
    CheckoutWrapperByChannelSetIdModule,
    CheckoutWrapperByChannelSetIdFinExpModule,
    CheckoutWrapperEditTransactionModule,
    CheckoutWidgetModule,
    CheckoutFormsCoreModule,
  ],
  providers: [
    ...CosEnvProviders,
    customLocale,
    dayJsLocale,
    { provide: APP_BASE_HREF, useValue: '/' },
    RefreshTokenGuard,
    {
      provide: APP_INITIALIZER,
      deps: [StorageService],
      multi: true,
      useFactory: appVersionFactory,
    },
  ],
})
export class CustomElementsModule {
  constructor(
    apmService: ApmService,
    private injector: Injector
  ) {
    apmService.init({
      logLevel: 'error',
      serviceName: 'checkout-app',
      serverUrl: environment.apis.custom?.elasticUrl,
      disableInstrumentations: ['error', 'xmlhttprequest', 'fetch'],
      serviceVersion: 'MICRO_CHECKOUT_VERSION',
    });
    apmService.observe();

    // Sometines APP_INITIALIZER is triggered too late and we have empty PE_ENV when requests started. So to fix that:
    const appInit = injector.get(APP_INITIALIZER);
    if (appInit) {
      const domain = location.hostname.startsWith('localhost')
        ? 'https://payeverstaging.azureedge.net'
        : 'MICRO_URL_CHECKOUT_CDN';
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `${domain}/js/pe-static.js`;
      script.defer = true;
      document.getElementsByTagName('head')[0].appendChild(script);

      if (!customElements.get('pe-checkout-wrapper-by-channel-set-id')) {
        customElements.define('pe-checkout-wrapper-by-channel-set-id', createCustomElement(
          PeCheckoutWrapperByChannelSetIdComponent,
          { injector: this.injector })
        );
      }
      if (!customElements.get('pe-checkout-wrapper-by-channel-set-id-finexp')) {
        customElements.define('pe-checkout-wrapper-by-channel-set-id-finexp', createCustomElement(
          PeCheckoutWrapperByChannelSetIdFinExpComponent,
          { injector: this.injector })
        );
      }
      if (!customElements.get('pe-checkout-wrapper-edit-transaction')) {
        customElements.define('pe-checkout-wrapper-edit-transaction', createCustomElement(
          PeCheckoutWrapperEditTransactionComponent,
          { injector: this.injector })
        );
      }
      if (!customElements.get('pe-checkout-widget')) {
        customElements.define('pe-checkout-widget', createCustomElement(
          PeCheckoutWidgetComponent,
          { injector: this.injector })
        );
      }
    }
  }

  // eslint-disable-next-line
  ngDoBootstrap(): void {
    // Do not delete, Required at least empty for prod mode.
  }
}
