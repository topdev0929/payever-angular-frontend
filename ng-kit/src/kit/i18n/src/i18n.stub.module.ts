import { ModuleWithProviders, NgModule } from '@angular/core';

import { LocaleConstantsService, TranslateStubService, TranslationLoaderStubService } from './services';
import { getLangList } from './lib';

import {
  I18N_CONFIG, LANG, DEFAULT_LANG, LOCALES
} from './constants';

@NgModule({})
export class I18nStubModule {
  public static forRoot(): ModuleWithProviders<I18nStubModule> {
    return {
      ngModule: I18nStubModule,
      providers: [
        LocaleConstantsService,
        TranslateStubService.provide(),
        TranslationLoaderStubService.provide(),
        { provide: LANG, useValue: DEFAULT_LANG },
        { provide: LOCALES, useFactory: getLangList },
        { provide: I18N_CONFIG, useValue: {} },
      ]
    }
  }
}
