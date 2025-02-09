import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { environment } from 'environments/environment';

import { TranslateService, TranslationGuard, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DevTranslationGuard extends TranslationGuard {
  // TODO: after making services protected in parent this can be removed
  private translateServiceRef: TranslateService;

  constructor(translationLoaderService: TranslationLoaderService, translateService: TranslateService) {
    super(translationLoaderService, translateService);

    this.translateServiceRef = translateService;
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    if (!environment.production) {
      const fallbackData = route.data.fallback;
      this.translateServiceRef.addTranslations(fallbackData);

      return of(true);
    }

    return super.canActivate(route);
  }
}
