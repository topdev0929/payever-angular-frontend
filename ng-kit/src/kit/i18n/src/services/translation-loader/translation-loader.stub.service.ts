import { Injectable, Provider } from '@angular/core';
import { Observable, of } from 'rxjs';

import { TranslationLoaderService } from './translation-loader.service';
import { TranslationLoaderServiceInterface } from './translation-loader.service.interface';

@Injectable()
export class TranslationLoaderStubService implements TranslationLoaderServiceInterface {

  nextResponse: boolean = true;
  lastI18nDomains: string | string[];

  loadTranslations(i18nDomains: string | string[]): Observable<boolean> {
    this.lastI18nDomains = i18nDomains;
    return of(this.nextResponse);
  }

  static provide(): Provider {
    return {
      provide: TranslationLoaderService,
      useClass: TranslationLoaderStubService
    };
  }

}
