import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { PeDataGridModule } from '@pe/data-grid';
import { AuthModule, PeAuthService } from '@pe/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PeEnvInitializer, PeEnvProvider } from './env.provider';
import { NgxsModule } from '@ngxs/store';
import { EnvService, MessageBus, PE_ENV } from '@pe/common';
import { PeStudioAuthTokenService, PeStudioWs, PE_STUDIO_WS_PATH, StudioEnvService, StudioMessageBus } from 'modules/studio/src';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { DragulaModule } from 'ng2-dragula';
import { MediaModule, MediaService, MediaUrlPipe } from '@pe/media';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

(window as any).PayeverStatic.IconLoader.loadIcons([
  'apps',
  'settings',
  'builder',
  'dock',
  'edit-panel',
  'social',
  'dashboard',
  'notification',
  'widgets',
  'payment-methods',
  'shipping',
  'banners',
  'commerceos'
]);


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    PePlatformHeaderModule,
    PeDataGridModule,
    NgxsSelectSnapshotModule,
    AuthModule.forRoot(),
    NgxsModule.forRoot(),
    DragulaModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({disabled: false}),
    MediaModule.forRoot({}),
    MatAutocompleteModule

  ],
  providers: [
    PeEnvProvider,
    PeEnvInitializer,
    MediaService,
    MediaUrlPipe,
    PeStudioWs,
    PeOverlayWidgetService,
    {
      provide: PE_STUDIO_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.studioWs,
    },
    {
      provide: PeStudioAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
    },
    {
      provide: MessageBus,
      useClass: StudioMessageBus
    },
    {
      provide: EnvService,
      useClass: StudioEnvService
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
