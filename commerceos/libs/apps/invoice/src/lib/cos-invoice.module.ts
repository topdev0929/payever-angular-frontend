import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { PeAuthService } from '@pe/auth';
import { CosMessageBus } from '@pe/base';
import {
  PEB_APPS_API_PATH,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_STORAGE_PATH,
  PebEditorAuthTokenService,
} from '@pe/builder/api';
import { PebEnvService } from '@pe/builder/core';
import { APP_TYPE, AppType, EnvService, MessageBus, PE_ENV, PebTranslateService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeCommonHeaderService } from '@pe/header';
import { TranslateService, TranslationGuard } from '@pe/i18n';
import { PE_MEDIA_CONTAINER } from '@pe/media';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';
import { THEMES_API_PATH, ThemesApi } from '@pe/themes';

import {
  BUILDER_MEDIA_API_PATH,
  PE_CONTACTS_HOST,
  PE_INVOICE_CONTAINER,
  PEB_INVOICE_API_COMMON_PATH,
  PEB_INVOICE_API_PATH,
  PEB_INVOICE_HOST,
} from './constants';
import { PeInvoiceHeaderService } from './invoice-header.service';
import { CosInvoiceRootComponent } from './root/cos-invoice-root.component';
import { PeInvoiceApi } from './services/invoice.api';
import { BusinessResolver } from './shared/resolvers/business.resolver';

const routes: Route[] = [
  {
    path: '',
    component: CosInvoiceRootComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: [
        'commerceos-grid-app',
        'commerceos-themes-app',
        'commerceos-products-list-app',
        'commerceos-products-editor-app',
        'commerceos-products-import-app',
        'commerceos-invoice-app',
      ],
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./invoice.module').then(m => m.PeInvoiceModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PeSimpleStepperModule,
  ],
  declarations: [
    CosInvoiceRootComponent,
  ],
  providers: [
    PeInvoiceHeaderService,
    PeCommonHeaderService,
    PeDataGridService,
    BusinessResolver,
    PeAlertDialogService,
    ThemesApi,
    PeInvoiceApi,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMedia,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PebTranslateService,
      useExisting: TranslateService,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
    },
    {
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: PE_MEDIA_CONTAINER,
      useValue: PE_INVOICE_CONTAINER,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: PEB_INVOICE_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.invoice + '/api',
    },
    {
      provide: PEB_APPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.invoice + '/api',
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoiceWs,
    },
    {
      provide: PEB_INVOICE_API_COMMON_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.common,
    },
    {
      provide: PE_CONTACTS_HOST,
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts,
    },
    {
      provide: PEB_INVOICE_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.invoiceHost,
    },
    {
      provide: 'PE_CONTACTS_HOST',
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [PE_ENV],
      useFactory: env => env.custom.storage,
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Invoice,
    },
  ],
})
export class CosNextInvoiceModule {
}
