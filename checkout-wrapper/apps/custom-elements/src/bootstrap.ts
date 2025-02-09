import { OverlayContainer } from '@angular/cdk/overlay';
import { APP_BASE_HREF } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID, enableProdMode, importProvidersFrom } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule, createApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ApmModule } from '@elastic/apm-rum-angular';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsModule } from '@ngxs/store';
// eslint-disable-next-line
import { CosEnvProviders } from 'apps/environments/env.provider';
// eslint-disable-next-line
import { customLocale, dayJsLocale } from 'apps/environments/locales';

import { AuthInterceptor, RefreshTokenGuard } from '@pe/auth';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { ErrorHandlerModule } from '@pe/checkout/main/error-handler';
import { StorageService } from '@pe/checkout/storage';
import { StoreModule } from '@pe/checkout/store';
import { ElementOverlayContainer } from '@pe/checkout/ui/overlay';
import { UtilsModule } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { environment } from '../../environments/environment';

import { appVersionFactory } from './app/app-version.token';
import { CheckoutWidgetModule, PeCheckoutWidgetComponent } from './app/checkout-widget';
import {
  CheckoutWrapperByChannelSetIdModule,
  PeCheckoutWrapperByChannelSetIdComponent,
} from './app/checkout-wrapper-by-channel-set-id';
import {
  CheckoutWrapperByChannelSetIdFinExpModule,
  PeCheckoutWrapperByChannelSetIdFinExpComponent,
} from './app/checkout-wrapper-by-channel-set-id-finexp';
import {
  CheckoutWrapperEditTransactionModule,
  PeCheckoutWrapperEditTransactionComponent,
} from './app/checkout-wrapper-edit-transaction';
import { CeAuthState } from './app/shared';

if (environment.production) {
  enableProdMode();
}

(async () => {
  const app = await createApplication({
    providers: [
      provideRouter([]),
      provideHttpClient(
        withInterceptorsFromDi(),
        withJsonpSupport(),
      ),

      importProvidersFrom(
        BrowserModule,
        BrowserAnimationsModule,
        UtilsModule,
        ApmModule,
        NgxsModule.forRoot([CeAuthState]),
        NgxsSelectSnapshotModule.forRoot(),
        StoreModule,
        CheckoutWrapperByChannelSetIdModule,
        CheckoutWrapperByChannelSetIdFinExpModule,
        CheckoutWrapperEditTransactionModule,
        CheckoutWidgetModule,
        CheckoutFormsCoreModule,
        ErrorHandlerModule,
      ),

      ...CosEnvProviders,
      customLocale,
      dayJsLocale,
      { provide: APP_BASE_HREF, useValue: '/' },
      {
        provide: OverlayContainer,
        useClass: ElementOverlayContainer,
      },
      RefreshTokenGuard,
      {
        provide: HTTP_INTERCEPTORS,
        multi: true,
        useClass: AuthInterceptor,
      },
      {
        provide: LOCALE_ID,
        useValue: $localize `:@@locale:en`,
      },
      {
        provide: APP_INITIALIZER,
        deps: [StorageService],
        multi: true,
        useFactory: appVersionFactory,
      },
    ],
  });

  const env = app.injector.get(PE_ENV);

  const domain = location.hostname.startsWith('localhost')
    ? 'https://payeverstaging.azureedge.net'
    : env.custom.translation;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `${domain}/js/pe-static.js`;
  script.defer = true;
  document.getElementsByTagName('head')[0].appendChild(script);

  if (!customElements.get('pe-checkout-wrapper-by-channel-set-id')) {
    customElements.define('pe-checkout-wrapper-by-channel-set-id', createCustomElement(
      PeCheckoutWrapperByChannelSetIdComponent,
      { injector: app.injector })
    );
  }
  if (!customElements.get('pe-checkout-wrapper-by-channel-set-id-finexp')) {
    customElements.define('pe-checkout-wrapper-by-channel-set-id-finexp', createCustomElement(
      PeCheckoutWrapperByChannelSetIdFinExpComponent,
      { injector: app.injector })
    );
  }
  if (!customElements.get('pe-checkout-wrapper-edit-transaction')) {
    customElements.define('pe-checkout-wrapper-edit-transaction', createCustomElement(
      PeCheckoutWrapperEditTransactionComponent,
      { injector: app.injector })
    );
  }
  if (!customElements.get('pe-checkout-widget')) {
    customElements.define('pe-checkout-widget', createCustomElement(
      PeCheckoutWidgetComponent,
      { injector: app.injector })
    );
  }
})();
