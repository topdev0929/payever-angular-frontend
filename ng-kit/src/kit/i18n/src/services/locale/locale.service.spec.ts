import { LocationStubService } from '../../../../location';
import { DEFAULT_LANG, DEFAULT_DEV_I18N_PATH } from '../../constants';
import { LocalesConfigInterface, LocaleInterface } from '../../interfaces';
import { getLangList } from '../../lib';
import { LocaleService } from './locale.service';
import { LocaleConstantsService } from '../locale-constants/locale-constants.service';

const localesConfig: LocalesConfigInterface = getLangList();

describe('LocaleService', () => {
  let service: LocaleService;

  const defaultLocaleCode: string = DEFAULT_LANG;
  const localeCodes: string[] = Object.keys(localesConfig);

  describe(`with default lang "${defaultLocaleCode}" and provider`, () => {
    beforeEach(() => {
      service = new LocaleService({}, new LocaleConstantsService({
        isProd: false,
        i18nPath: DEFAULT_DEV_I18N_PATH,
        useStorageForLocale: false
      }),
      new LocationStubService());
    });

    it('currentLocale$ should be available and be equal to config', () => {
      const currentLocale: LocaleInterface = service.currentLocale$.getValue();
      const targetLocale: LocaleInterface = {
        code: defaultLocaleCode,
        ...localesConfig[defaultLocaleCode]
      };
      expect(currentLocale).toEqual(targetLocale);
    });

    it('should set another currentLocale$', () => {
      let result: boolean;
      const oldCurrentLocale: LocaleInterface = service.currentLocale$.getValue();
      const localeCodes: string[] = service.locales$.getValue().map(({ code }) => code);

      const newLocaleCode: string = localeCodes.find(code => code !== oldCurrentLocale.code);
      expect(oldCurrentLocale.code).not.toBe(newLocaleCode); // self-test

      result = service.setCurrentLocale(newLocaleCode);
      expect(result).toBe(true);
      const newCurrentLocale: LocaleInterface = service.currentLocale$.getValue();
      expect(newCurrentLocale).not.toEqual(oldCurrentLocale);
      expect(newCurrentLocale.code).not.toBe(oldCurrentLocale.code);
      expect(newCurrentLocale.code).toBe(newLocaleCode);

      const unknownLocaleCode: string = 'unknown_locale_code';
      result = service.setCurrentLocale(unknownLocaleCode);
      expect(result).toBe(false, 'should not be able to setup unknown locale as current');
    });

    it('locales$ should be available and be equal to config', () => {
      const locales: LocaleInterface[] = service.locales$.getValue();
      localeCodes.forEach(code => {
        const locale: LocaleInterface = locales.find(({ code: localeCode }) => localeCode === code);
        expect(locale).toBeTruthy();
        expect(locale).toEqual({
          code,
          ...localesConfig[code],
        });
      });
    });

    // it('with useStorageForLocale=true', () => {
    //   const locationStub: LocationStubService = new LocationStubService();
    //   expect(locationStub.reloaded).toBe(false);
    //   service = new LocaleService(localesConfig, defaultLocaleCode, {useStorageForLocale: true}, locationStub, translationLoaderService);
    //   service.changeCurrentLocale('es');
    //   expect(locationStub.reloaded).toBe(true);
    //   expect(retrieveLocale()).toBe('es');
    // });
  });

  describe('with different langs', () => {
    localeCodes
      .filter(code => code !== defaultLocaleCode)
      .forEach(localeCode => {
        it(`should accept lang "${localeCode}"`, () => {
          document.documentElement.lang = localeCode;
          const localeConstantsService: LocaleConstantsService = new LocaleConstantsService({
            isProd: false,
            i18nPath: DEFAULT_DEV_I18N_PATH,
            useStorageForLocale: false
          });
          service = new LocaleService({}, localeConstantsService, new LocationStubService()); // TODO
          expect(service.currentLocale$.getValue().code).toBe(localeCode);
        });
      });

    afterAll(() => {
      document.documentElement.lang = DEFAULT_LANG;
    });
  });

});
