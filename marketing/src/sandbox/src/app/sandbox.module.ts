import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxIndexedDBModule } from 'ngx-indexed-db';

import {
  MessageBus,
  PebEnvService,
  PebMediaService,
  PebTranslateService,
  PEB_ENTITY_NAME,
} from '@pe/builder-core';
import {
  PebActualEditorApi,
  PebActualProductsApi,
  PebActualShopThemesApi,
  PebEditorApi,
  PebProductsApi,
  PebThemesApi,
  PEB_EDITOR_API_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PRODUCTS_API_PATH,
} from '@pe/builder-api';

import { SandboxMockBackend } from '../dev/editor.api-local';
import { SandboxRootComponent } from './root/root.component';
import { SandboxRouting } from './sandbox.routing';
import { MockEditorDatabaseConfig } from '../dev/editor.idb-config';
import { SandboxEnv } from './sandbox.env';
import { SandboxDBService } from '../dev/sandbox-idb.service';
import { SandboxTranslateService } from '../dev/sandbox-translate.service';
import { SandboxMessageBus } from './shared/services/message-bus.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CdkPortalModule,
    SandboxRouting,
    NgxIndexedDBModule.forRoot(MockEditorDatabaseConfig),
  ],
  declarations: [SandboxRootComponent],
  providers: [
    SandboxDBService,
    {
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },

    /**
     * Builder API: either SandboxMockBackend or PebEditorApi + BUILDER_API_PATH + PebThemesApi
     */
    {
      provide: PebEditorApi,
      useClass: SandboxMockBackend,
    },

    /**
     * Products API
     */
    {
      provide: PebProductsApi,
      useClass: PebActualProductsApi,
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      // useValue: 'https://products-backend.test.devpayever.com',
      useValue: 'https://products-backend.staging.devpayever.com',
    },

    {
      provide: PEB_MEDIA_API_PATH,
      // useValue: 'https://media.test.devpayever.com',
      useValue: 'https://media.staging.devpayever.com',
    },

    /**
     * Other APIs. Need to be made more configurable
     */
    {
      provide: PEB_GENERATOR_API_PATH,
      // useValue: 'https://builder-generator.test.devpayever.com',
      useValue: 'https://builder-generator.staging.devpayever.com',
    },
    {
      provide: PEB_STORAGE_PATH,
      // useValue: 'https://payevertesting.blob.core.windows.net',
      useValue: 'https://payeverstaging.blob.core.windows.net',
    },
    {
      provide: PRODUCTS_API_PATH,
      // useValue: 'https://products-frontend.test.devpayever.com',
      useValue: 'https://products-frontend.staging.devpayever.com',
    },
    {
      provide: PEB_ENTITY_NAME,
      useValue: 'mail',
    },
  ],
  bootstrap: [SandboxRootComponent],
})
export class SandboxModule {}
