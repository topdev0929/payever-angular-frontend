import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxIndexedDBModule } from 'ngx-indexed-db';

import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { FormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { AUTH_ENV, AuthModule } from '@pe/auth';
import { EnvService, MessageBus, PE_ENV, PebTranslateService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import {
  PEB_SHOP_HOST,
} from '@pe/settings';
import { EnvironmentConfigService, PlatformService } from '../../../modules/settings/src/services';
import { MockEditorDatabaseConfig } from '../dev/editor.idb-config';
import { SandboxTranslateService } from '../dev/sandbox-translate.service';
import { TokenInterceptor } from '../dev/token.interceptor';
import { COS_ENV, CosEnvInitializer, CosEnvProvider } from './env.provider';
import { SandboxFrontRouteComponent } from './root/front.route';
import { SandboxRootComponent } from './root/root.component';
import { SandboxEnv } from './sandbox.env';
import { SandboxRouting } from './sandbox.routing';
import { SandboxMessageBus } from './shared/services/message-bus.service';
import { SandboxSettingsDialog } from './shared/settings/settings.dialog';

declare var PayeverStatic: any;

PayeverStatic.IconLoader.loadIcons([
  'set',
  'apps',
  'industries',
  'settings',
  'builder',
  'dock',
  'edit-panel',
  'social',
  'dashboard',
  'notification',
  'commerceos',
  'widgets',
  'payment-methods',
  'payment-plugins',
  'shipping',
  'finance-express',
  'statistics',
]);

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CdkPortalModule,
    SandboxRouting,
    NgxIndexedDBModule.forRoot(MockEditorDatabaseConfig),
    AuthModule,
    PePlatformHeaderModule,
    MatGoogleMapsAutocompleteModule,
    MatMomentDateModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDB-7kzuFYxb8resf60yF21TKUkTbGhljc',
      libraries: ['places'],
    }),
  ],
  declarations: [
    SandboxRootComponent,
    SandboxFrontRouteComponent,
    SandboxSettingsDialog,
  ],
  providers: [
    CosEnvInitializer,
    CosEnvProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: TranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: PE_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: AUTH_ENV,
      deps: [COS_ENV],
      useFactory: env => env,
    },
    {
      provide: PEB_SHOP_HOST,
      deps: [COS_ENV],
      useFactory: env => env.primary.shopHost,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'settings',
    },
    PlatformService,
    {
      provide: EnvironmentConfigService,
      deps: [PE_ENV],
      useFactory (env) {
        const service = new EnvironmentConfigService();
        service.addConfig(env);
        return service;
      },
    },
  ],
  bootstrap: [ SandboxRootComponent ],
})
export class SandboxModule {}
