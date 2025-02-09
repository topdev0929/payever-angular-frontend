import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

import { TranslationLoaderService, TranslateService } from '../services';

const GET_TRANSLATIONS_TIMEOUT = 5000;

@Injectable()
export class TranslationGuard implements CanActivate {

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private translateService: TranslateService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const i18nDomains: string = route.data['i18nDomains'];
    if (!i18nDomains) {
      throw new Error('no i18nDomains provided in route protected by TranslationGuard');
    }

    // Guard shouldn't block work of apps even though some of the translations were not properly loaded
    return this.translationLoaderService.loadTranslations(i18nDomains).pipe(
      timeout(GET_TRANSLATIONS_TIMEOUT),
      catchError(err => {
        console.warn('Cant load traslations for domains', i18nDomains, err);
        const fallbackData = route.data['fallback'];
        if (fallbackData) {
          console.warn('Use fallback translations');
          this.translateService.addTranslations(fallbackData);
        }
        return of(true);
      }),
    );
  }
}
