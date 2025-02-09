import { CurrencySymbolPipe } from './currency-symbol.pipe';
import { CurrencyPipe } from '../currency/currency.pipe';
import { registerLocaleData } from '../../lib';
import { DEFAULT_DEV_I18N_PATH } from '../../constants';
import { LocaleConstantsService } from '../../services';

describe('CurrencySymbolPipe', () => {
  let pipe: CurrencySymbolPipe;

  enum TestingLangs {
    en = 'en',
    de = 'de',
    es = 'es',
    no = 'nb',
    da = 'da',
    sv = 'sv',
  }

  const localeConstantsService: LocaleConstantsService = new LocaleConstantsService({
    isProd: true,
    i18nPath: DEFAULT_DEV_I18N_PATH,
    useStorageForLocale: true
  });

  describe(`with LANG="${TestingLangs.en}"`, () => {
    it('should return proper symbols', () => {
      pipe = new CurrencySymbolPipe(new CurrencyPipe(TestingLangs.en, null));
      expect(pipe.transform('USD', TestingLangs.en)).toBe('$');
      expect(pipe.transform('EUR', TestingLangs.en)).toBe('€');
      expect(pipe.transform('NOK', TestingLangs.en)).toBe('NOK');
      expect(pipe.transform('DKK', TestingLangs.en)).toBe('DKK');
      expect(pipe.transform('SEK', TestingLangs.en)).toBe('SEK');
    });
  });

  describe(`with LANG="${TestingLangs.de}"`, () => {
    it('should return proper symbols', () => {
      pipe = new CurrencySymbolPipe(new CurrencyPipe(TestingLangs.de, null));
      expect(pipe.transform('USD', TestingLangs.de)).toBe('$');
      expect(pipe.transform('EUR', TestingLangs.de)).toBe('€');
      expect(pipe.transform('NOK', TestingLangs.de)).toBe('NOK');
      expect(pipe.transform('DKK', TestingLangs.de)).toBe('DKK');
      expect(pipe.transform('SEK', TestingLangs.de)).toBe('SEK');
    });
  });

  describe(`with LANG="${TestingLangs.es}"`, () => {
    it('should return proper symbols', () => {
      pipe = new CurrencySymbolPipe(new CurrencyPipe(TestingLangs.es, null));
      expect(pipe.transform('USD', TestingLangs.es)).toBe('US$');
      expect(pipe.transform('EUR', TestingLangs.es)).toBe('€');
      expect(pipe.transform('NOK', TestingLangs.es)).toBe('NOK');
      expect(pipe.transform('DKK', TestingLangs.es)).toBe('DKK');
      expect(pipe.transform('SEK', TestingLangs.es)).toBe('SEK');
    });
  });

  describe(`with LANG="${TestingLangs.no}"`, () => {
    it('should return proper symbols', () => {
      pipe = new CurrencySymbolPipe(new CurrencyPipe(TestingLangs.no, null));
      expect(pipe.transform('USD', TestingLangs.no)).toBe('USD');
      expect(pipe.transform('EUR', TestingLangs.no)).toBe('€');
      expect(pipe.transform('NOK', TestingLangs.no)).toBe('kr');
      expect(pipe.transform('DKK', TestingLangs.no)).toBe('DKK');
      expect(pipe.transform('SEK', TestingLangs.no)).toBe('SEK');
    });
  });

  describe(`with LANG="${TestingLangs.da}"`, () => {
    it('should return proper symbols', () => {
      pipe = new CurrencySymbolPipe(new CurrencyPipe(TestingLangs.da, null));
      expect(pipe.transform('USD', TestingLangs.da)).toBe('$');
      expect(pipe.transform('EUR', TestingLangs.da)).toBe('€');
      expect(pipe.transform('NOK', TestingLangs.da)).toBe('NOK');
      expect(pipe.transform('DKK', TestingLangs.da)).toBe('kr');
      expect(pipe.transform('SEK', TestingLangs.da)).toBe('SEK');
    });
  });

  describe(`with LANG="${TestingLangs.sv}"`, () => {
    it('should return proper symbols', () => {
      pipe = new CurrencySymbolPipe(new CurrencyPipe(TestingLangs.sv, null));
      expect(pipe.transform('USD', TestingLangs.sv)).toBe('US$');
      expect(pipe.transform('EUR', TestingLangs.sv)).toBe('€');
      expect(pipe.transform('NOK', TestingLangs.sv)).toBe('Nkr');
      expect(pipe.transform('DKK', TestingLangs.sv)).toBe('Dkr');
      expect(pipe.transform('SEK', TestingLangs.sv)).toBe('kr');
    });
  });
});
