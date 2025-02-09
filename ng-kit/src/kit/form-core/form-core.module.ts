import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon'; // For FormAddonComponent
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For FormAddonComponent

import { NgxWebstorageModule } from 'ngx-webstorage';
import { CommonModule as PeCommonModule } from '../common';
import { DialogModule } from '../dialog';
import { I18nModule } from '../i18n';
import { DevModule } from '../dev';

import {
  FormAddonComponent,
  FormAddonInlinePrependComponent,
} from './components/addon';

import { GenericDateAdapter } from './date-adapters';
import { TransformDateService, ErrorNormalizerService, ErrorBag } from './services';
import { BooleanPipe, RawPipe, LocaleDatePipe, LocaleMonthPipe } from './pipes';
import { BlockCopyPasteDirective } from './directives';
import { BrowserModule } from '../browser/src';

import { FORM_DATE_ADAPTER } from './constants';

const shared: any = [
  FormAddonComponent,
  FormAddonInlinePrependComponent,
];

// @dynamic
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DevModule,
    I18nModule.forChild(),
    NgxWebstorageModule.forRoot({
      prefix: 'pe.common',
      separator: '.',
      caseSensitive: true
    }),
    BrowserModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DialogModule,
    PeCommonModule.forRoot()
  ],
  declarations: [
    ...shared,
    BooleanPipe,
    RawPipe,
    LocaleDatePipe,
    LocaleMonthPipe,
    BlockCopyPasteDirective
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    BooleanPipe,
    RawPipe,
    LocaleDatePipe,
    LocaleMonthPipe,
    BlockCopyPasteDirective
  ],
  providers: [
    ErrorBag,
    ErrorNormalizerService,
    TransformDateService,
    {
      provide: FORM_DATE_ADAPTER,
      useClass: GenericDateAdapter,
      deps: [TransformDateService]
    }
  ]
})
export class FormCoreModule {}
