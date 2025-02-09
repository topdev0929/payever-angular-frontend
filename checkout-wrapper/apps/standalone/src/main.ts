import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withJsonpSupport } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationRef, enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication, enableDebugTools } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';

import { ApiModule } from '@pe/checkout/api';
import { ErrorHandlerModule } from '@pe/checkout/main/error-handler';
import { PluginsModule } from '@pe/checkout/plugins';
import { StorageModule, StorageService } from '@pe/checkout/storage';

import { CosEnvProviders } from '../../environments/env.provider';
import { environment } from '../../environments/environment';
import { customLocale, dayJsLocale } from '../../environments/locales';

import { appVersionFactory } from './app/app-version.token';
import { StandaloneAuthState } from './app/auth';
import { RootComponent } from './app/components/root/root.component';
import { StandaloneAuthInterceptor } from './app/interceptors';
import { appRoutes } from './app/routes';

if (environment.production) {
  enableProdMode();
}
setTimeout(() => {
  bootstrapApplication(RootComponent, {
    providers: [
      provideRouter(appRoutes),
      provideHttpClient(withInterceptorsFromDi(), withJsonpSupport()),
      ...CosEnvProviders,
      customLocale,
      dayJsLocale,

      importProvidersFrom(
        BrowserModule,
        BrowserAnimationsModule,

        NgxsModule.forRoot([StandaloneAuthState]),
        NgxsSelectSnapshotModule.forRoot(),
        NgxsReduxDevtoolsPluginModule.forRoot({
          disabled: environment.production,
        }),

        ErrorHandlerModule,
        ApiModule,
        PluginsModule,
        StorageModule,
      ),
      {
        provide: HTTP_INTERCEPTORS,
        multi: true,
        useClass: StandaloneAuthInterceptor,
      },
      {
        provide: APP_INITIALIZER,
        deps: [StorageService],
        multi: true,
        useFactory: appVersionFactory,
      },
    ],
  }).then((module) => {
    enableDebugTools(module.injector.get(ApplicationRef).components[0]);
  });
});
