import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import localeDE from '@angular/common/locales/en-DE';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { TransferHttpModule, TransferHttpService } from '@gorniv/ngx-universal';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { CommonModule } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigModule } from '@pe/ng-kit/modules/environment-config';
import { I18nModule } from '@pe/ng-kit/modules/i18n';
import { MicroModule } from '@pe/ng-kit/modules/micro';
import { CheckoutApiModule } from '@pe/checkout-sdk/sdk/api';
import { StorageModule } from '@pe/checkout-sdk/sdk/storage';
import { PluginsModule } from '@pe/checkout-sdk/sdk/plugins';

import { TRANSFER_HTTP_SERVICE } from '../modules/checkout/inject-tokens';
import { CheckoutModule } from '../modules/checkout/checkout.module';
import { CoreApolloModule } from '../modules/core-apollo.module';
import { AppRoutingModule } from './app-routing.module';
import { RootComponent } from './components/index';
import { AppCoreModule } from './core/index';
import { MerchantModeGuard } from './guards';
import { CustomHeadersInterceptor } from './interceptors';
import { ClientLauncherService } from './services/client-launcher.service';
import { CustomRouteReuseStrategy } from './services/custom-reuse-strategy';

registerLocaleData(localeDE, 'en-DE');

@NgModule({
  imports: [
    AppCoreModule,
    // StateTransferInitializerModule,
    // BrowserTransferStateModule,
    TransferHttpModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    NgxWebstorageModule.forRoot({
      prefix: '',
      separator: '',
    }),

    EnvironmentConfigModule.forRoot(),
    BrowserAnimationsModule,
    MicroModule.forRoot(),
    CheckoutApiModule,
    StorageModule,
    PluginsModule,
    HttpLinkModule,
    // IconsProviderModule,
    CommonModule.forRoot(),
    I18nModule.forRoot({
      useStorageForLocale: true,
    }),
    AppRoutingModule,
    CheckoutModule.forRoot(),
    CoreApolloModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHeadersInterceptor,
      multi: true,
    },
    TransferHttpService,
    {
      provide: TRANSFER_HTTP_SERVICE,
      useClass: TransferHttpService,
    },
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
    MerchantModeGuard,
    AuthService,
    ClientLauncherService,
  ],
  declarations: [
    RootComponent,
  ],
})
export class AppModule {
}
