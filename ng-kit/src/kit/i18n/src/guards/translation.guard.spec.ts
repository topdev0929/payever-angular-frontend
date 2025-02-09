import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TranslationLoaderService } from '../services/translation-loader';
import { TranslateService } from '../services/translate';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TranslationGuard } from './translation.guard';

describe('TranslationGuard', () => {

  const i18nDomains: string = 'string';
  const fallback: string = 'fallback';
  let translationLoaderService: any;
  let translateService: any;
  let activatedRouteSnapshot: any;
  let translationGuard: any;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        TranslationGuard,
        {
          provide: TranslationLoaderService,
          useValue: {
            loadTranslations: jasmine.createSpy()
          }
        },
        {
          provide: TranslateService,
          useValue: {
            addTranslations: jasmine.createSpy()
          }
        },
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            data: {
              i18nDomains,
              fallback
            }
          }
        }
      ]
    });

    translationGuard = TestBed.get(TranslationGuard);
    translationLoaderService = TestBed.get(TranslationLoaderService);
    translateService = TestBed.get(TranslateService);
    activatedRouteSnapshot = TestBed.get(ActivatedRouteSnapshot);
  });

  it('canActivate should call loadTranslations and return resolved Promise', fakeAsync(() => {
    translationLoaderService.loadTranslations.and.returnValue(of({}));
    expect(translationGuard.canActivate(activatedRouteSnapshot) instanceof Promise).toBeTruthy();

    tick();

    expect(translationLoaderService.loadTranslations).toHaveBeenCalledWith(i18nDomains);
  }));

  it('canActivate should call loadTranslations, addTranslations and return resolved Promise', fakeAsync(() => {
    translationLoaderService.loadTranslations.and.returnValue(throwError(new Error('error')));
    expect(translationGuard.canActivate(activatedRouteSnapshot) instanceof Promise).toBeTruthy();

    tick();

    expect(translationLoaderService.loadTranslations).toHaveBeenCalledWith(i18nDomains);

    tick(6000);

    expect(translateService.addTranslations).toHaveBeenCalledWith(fallback);
  }));
});
