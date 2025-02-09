// tslint:disable max-classes-per-file

// @TODO uncomment when i18n logic will be stable

/*
import {
  Http,
  ConnectionBackend,
  RequestOptions,
  BaseRequestOptions,
  Response,
  ResponseOptions
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgModule } from '@angular/core';

import { TranslationLoaderService } from './translation-loader.service';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { TranslateService } from '../translate/translate.service';
import { LANG, DEFAULT_LANG, I18N_PATH } from '../../constants';
import { PlainTranslationsInterface } from '../../interfaces';

class TranslateServiceTest extends TranslateService {
  reset(): void {
    this['plainTranslations'] = {};
    this['translations'] = {};
  }
}

@NgModule({
  providers: [
    { provide: TranslateService, useValue: new TranslateServiceTest() },
    { provide: ConnectionBackend, useClass: MockBackend },
    { provide: RequestOptions, useClass: BaseRequestOptions },
    Http,
    TranslationLoaderService
  ]
})
class TranslationLoaderTestModule {}

describe('TranslationLoaderService', () => {
  let service: TranslationLoaderService;
  let translateService: TranslateServiceTest;
  let lastConnection: any; // yes, `any`, as in off. docs: https://angular.io/api/http/testing/MockBackend

  const defaultLang: string = DEFAULT_LANG;

  const injectServices: () => void = () => {
    service = TestBed.get(TranslationLoaderService);
    translateService = TestBed.get(TranslateService) as TranslateServiceTest;
    translateService.reset();
    const backend: MockBackend = TestBed.get(ConnectionBackend);
    backend.connections.subscribe((connection: any) => lastConnection = connection);
  };

  describe(`with default lang "${defaultLang}"`, () => {
    nonRecompilableTestModuleHelper({
      imports: [TranslationLoaderTestModule],
      providers: [
        { provide: LANG, useValue: defaultLang },
        { provide: I18N_PATH, useValue: '[i18n_path]' },
      ]
    });

    beforeEach(injectServices);

    it('load translations from backend (success)', fakeAsync(() => {
      const i18nKey: string = '[i18nKey200]';
      const translations: PlainTranslationsInterface = {
        key1: '[translation_value_1]',
        key2: '[translation_value_2]',
      };
      const serializedTranslations: string = JSON.stringify(translations);

      // pre-test, self-check
      expect(translateService.hasTranslation('key1')).toBe(false);
      expect(translateService.hasTranslation('key2')).toBe(false);

      let result: boolean;
      service.loadTranslations(i18nKey)
        .subscribe(
          res => result = res,
          fail
        );
      lastConnection.mockRespond(
        new Response(new ResponseOptions({ body: serializedTranslations }))
      );
      tick();
      expect(result).toBe(true);
      expect(translateService.translate('key1')).toBe(translations['key1']);
      expect(translateService.translate('key2')).toBe(translations['key2']);
      expect(lastConnection.request.url).toContain(i18nKey);
      expect(lastConnection.request.url).toContain(`${defaultLang}.json`);
    }));

    it('try load translations from backend (404) and not save them', fakeAsync(() => {
      const i18nKey: string = '[i18nKey404]';

      let result: boolean;
      let errResult: any;
      service.loadTranslations(i18nKey)
        .subscribe(
          res => result = res,
          err => errResult = err,
        );
      lastConnection.mockError(
        new Response(new ResponseOptions({
          status: 404,
          statusText: 'Not Found'
        }))
      );
      tick();
      expect(result).toBeUndefined();
      expect(errResult).toBeDefined();
      expect(errResult instanceof Error).toBe(true);
      expect(lastConnection.request.url).toContain(i18nKey);
      expect(lastConnection.request.url).toContain(`${defaultLang}.json`);
    }));
  });

  const otherLangs: string[] = ['de', 'ru'];

  otherLangs.forEach(otherLang => {
    describe(`with language "${otherLang}"`, () => {
      nonRecompilableTestModuleHelper({
        imports: [TranslationLoaderTestModule],
        providers: [
          { provide: LANG, useValue: otherLang },
          { provide: I18N_PATH, useValue: '[i18n_path]' },
        ]
      });

      beforeEach(injectServices);

      it('load translations from backend', fakeAsync(() => {
        const i18nKey: string = `[i18nKey_${otherLang}]`;
        const translations: PlainTranslationsInterface = {
          key10: '[translation_value_10]',
        };
        const serializedTranslations: string = JSON.stringify(translations);

        let result: boolean;
        service.loadTranslations(i18nKey)
          .subscribe(
            res => result = res,
            fail
          );
        lastConnection.mockRespond(
          new Response(new ResponseOptions({ body: serializedTranslations }))
        );
        tick();
        expect(result).toBe(true);
        expect(lastConnection.request.url).toContain(`${otherLang}.json`);
        expect(translateService.translate('key10')).toBe(translations['key10']);
      }));
    });
  });

});
*/
