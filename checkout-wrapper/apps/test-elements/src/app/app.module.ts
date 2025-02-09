import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Route, RouterModule } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { AuthInterceptor } from '@pe/auth';
import { ApiModule } from '@pe/checkout/api';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { ErrorHandlerModule } from '@pe/checkout/main/error-handler';
import { SnackBarModule } from '@pe/checkout/ui/snackbar';
import { UtilsModule } from '@pe/checkout/utils';

/* eslint-disable */
import { CustomElementsModule } from '../../../custom-elements/src/app/custom-elements.module';
/* eslint-enable */
import { CosEnvProviders } from '../../../environments/env.provider';
import { environment } from '../../../environments/environment';
import { customLocale, dayJsLocale } from '../../../environments/locales';

import { AppComponent } from './app.component';
import {
  DevComponent,
  DevCustomElementAsFinexpComponent,
  DevCustomElementByChannelSetIdFinExpComponent,
  DevCustomElementByChannelSetIdComponent,
  DevEditTransactionComponent,
  DevLibByChannelSetIdComponent,
  DevLibCheckoutWidgetComponent,
  ParamsComponent,
} from './components';

const routes: Route[] = [
  {
    path: 'en',
    component: DevComponent,
  },
  {
    path: 'en/custom-element-by-channel-set-id',
    component: DevCustomElementByChannelSetIdComponent,
  },
  {
    path: 'en/custom-element-by-channel-set-id-finexp',
    component: DevCustomElementByChannelSetIdFinExpComponent,
  },
  {
    path: 'en/custom-element-as-finexp',
    component: DevCustomElementAsFinexpComponent,
  },
  {
    path: 'en/edit-transaction',
    component: DevEditTransactionComponent,
  },
  {
    path: 'en/lib-by-channel-set-id',
    component: DevLibByChannelSetIdComponent,
  },
  {
    path: 'en/lib-checkout-widget',
    component: DevLibCheckoutWidgetComponent,
  },
  {
    path: 'en/iframe',
    loadComponent: () => import('./components/dev-iframe').then(m => m.DevIframeComponent),
  },
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    ApiModule,
    FormUtilsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    NgxWebstorageModule.forRoot(),
    HttpClientModule,
    UtilsModule,
    CustomElementsModule,
    ErrorHandlerModule,
    SnackBarModule,
    ReactiveFormsModule,

    NgxsModule.forRoot(),
    NgxsSelectSnapshotModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
  ],
  declarations: [
    AppComponent,
    DevComponent,
    DevCustomElementByChannelSetIdComponent,
    DevCustomElementByChannelSetIdFinExpComponent,
    DevCustomElementAsFinexpComponent,
    DevEditTransactionComponent,
    DevLibByChannelSetIdComponent,
    DevLibCheckoutWidgetComponent,
    ParamsComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: AuthInterceptor,
    },
    ...CosEnvProviders,
    customLocale,
    dayJsLocale,
  ],
  bootstrap: [ AppComponent ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class AppModule {
  constructor(
    apmService: ApmService,
  ) {
    apmService.init({
      logLevel: 'error',
      serviceName: 'checkout-app',
      serverUrl: environment.apis.custom?.elasticUrl,
      disableInstrumentations: ['error', 'xmlhttprequest', 'fetch'],
      serviceVersion: 'MICRO_CHECKOUT_VERSION',
    });
    apmService.observe();
  }
}
