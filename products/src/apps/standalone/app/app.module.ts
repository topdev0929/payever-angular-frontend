import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import * as localeDE from '@angular/common/locales/en-DE';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, registerLocaleData } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AUTH_ENV, AuthModule } from '@pe/auth';
import { EnvironmentConfigInterface, MessageBus, PE_ENV } from '@pe/common';
import { I18nModule, TranslationGuard } from '@pe/i18n';
import { MEDIA_ENV, MediaModule, MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { PeStepperModule } from '@pe/stepper';
import { PebEnvService } from '@pe/builder-core';
import { SnackbarService } from '@pe/snackbar';
import { SnackbarConfig } from '@pe/snackbar/lib/snackbar.model';

import { ProductsHeaderService } from './modules/services/products-header.service';
import { TokenDevComponent } from '../../../token-dev/token-dev.component'; // setup token for dev
import { COS_ENV, CosEnvInitializer, CosEnvProvider } from './env.provider';
import { BusinessGuard } from './guards'; // PlatformHeaderGuard
import { PlatformHeaderService } from './modules/services/app-platform-header.service';
import { AppComponent } from './components/app.component';
import { LoadingGuard } from './resolvers';
import { environment } from '../../../environments/environment';
import { SandboxEnv } from './sandbox.env';
import { SandboxMessageBus } from './sandox-message-bus';
import { TokenInterceptor } from './modules/services/token.interceptor';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DragulaModule } from 'ng2-dragula';


let devModules: any = [StoreDevtoolsModule.instrument({})];
if (environment.production) {
  devModules = [];
}

registerLocaleData(localeDE, 'en-DE');

@NgModule({
  declarations: [
    TokenDevComponent,
    AppComponent,
    // ProductsListComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    MatDialogModule,
    DragulaModule.forRoot(),
    PeStepperModule.forRoot(),
    NgxsModule.forRoot(),
    AuthModule.forRoot(),
    MediaModule.forRoot({}),

    PePlatformHeaderModule,
    ...devModules,
    HammerModule,
    I18nModule.forRoot(),
    RouterModule.forRoot([
      {
        path: 'business/:slug',
        canActivate: [BusinessGuard],
        data: {
          // i18nDomains: ['products-list', 'products-editor', 'ng-kit-ng-kit'],
        },
        resolve: {
          // LoadingGuard
        },
        children: [
          {
            path: 'products',
            loadChildren: () => import('@pe/products-app').then(m => m.ProductsModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: ['products-list', 'products-editor', 'ng-kit-ng-kit'],
              isFromDashboard: true,
            },
          },
        ],
      },
    ]),
    NgxWebstorageModule.forRoot(),
  ],
  providers: [
    BusinessGuard,

    LoadingGuard,

    CosEnvProvider,
    CosEnvInitializer,
    MediaUrlPipe,
    ProductsHeaderService,

    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderService,
    },
    {
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: SnackbarService,
      useValue: {
        toggle: (isVisible: boolean, config?: SnackbarConfig) => {},
      },
    },
    {
      provide: MEDIA_ENV,
      useFactory: (env: any) => ({ custom: env.custom, backend: env.backend }),
      deps: [COS_ENV],
    },
    {
      provide: AUTH_ENV,
      useFactory: (env: any) => env,
      deps: [COS_ENV],
    },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: (env: EnvironmentConfigInterface) => env,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

