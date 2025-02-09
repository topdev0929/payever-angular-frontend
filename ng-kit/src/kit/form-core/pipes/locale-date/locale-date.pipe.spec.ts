import { LocaleDatePipe } from './locale-date.pipe';
import { GenericDateAdapter } from '../../date-adapters';
import { TransformDateService } from '../../services';
import {
  getDateFormatShortMoment,
  getLang,
  getLangList,
  LocalesConfigInterface,
  LocaleConstantsService,
  DEFAULT_DEV_I18N_PATH,
  DEFAULT_LANG
} from '../../../i18n';

describe('LocaleDatePipe', () => {
  let pipe: LocaleDatePipe;
  let transformDate: TransformDateService;
  let dateFormat: string;

  const localesConfig: LocalesConfigInterface = Object.freeze(getLangList());
  const DEFAULT_LOCALE: string = getLang({});
  const DEFAULT_EMPTY_DATE_PLACEHOLDER: string = '---';

  function setupPipeFor(locale: string): void {
    document.documentElement.lang = locale;
    transformDate = new TransformDateService();
    const localeConstantsService: LocaleConstantsService = new LocaleConstantsService({
      isProd: true,
      i18nPath: DEFAULT_DEV_I18N_PATH,
      useStorageForLocale: false
    });
    const dateAdapter: GenericDateAdapter = new GenericDateAdapter(transformDate);
    dateFormat = getDateFormatShortMoment(localesConfig, locale);

    pipe = new LocaleDatePipe(
      dateAdapter,
      transformDate,
      localeConstantsService
    );
  }

  describe('with default settings', () => {
    const locale: string = DEFAULT_LOCALE;

    beforeEach(() => setupPipeFor(locale));

    it('should create the pipe', () => {
      expect(pipe).toBeTruthy();
    });

    it('should parse Date value', () => {
      const date: Date = new Date(1999, 10, 10);
      const parsed: string = pipe.transform(date);
      expect(parsed).toBe(transformDate.format(date, locale, dateFormat));
    });

    it('should render empty value for falsy input', () => {
      const falsyValues: any[] = [
        '',
        null,
        undefined,
        'null',
        0,
        -0,
        NaN,
        Infinity,
        -Infinity,
      ];
      expect(falsyValues.length).toBeGreaterThan(0);
      falsyValues.forEach(value => {
        const parsed: string = pipe.transform(value);
        expect(parsed).toBe(DEFAULT_EMPTY_DATE_PLACEHOLDER, `falsy value "${value}" should not be parsed`);
      });
    });

    it('should render empty value for invalid input', () => {
      const falsyValues: any[] = [
        `${(new Date()).toISOString()}2k4jl234`,
        `${(new Date()).toString()}j4hj5h`,
        `${(new Date()).toUTCString()}4234k2`,
        `asfkjasfjas`,
      ];
      expect(falsyValues.length).toBeGreaterThan(0);
      falsyValues.forEach(value => {
        const parsed: string = pipe.transform(value);
        expect(parsed).toBe(DEFAULT_EMPTY_DATE_PLACEHOLDER, `falsy value "${value}" should not be parsed`);
      });
    });

    it('should accept emptyDatePlaceholder', () => {
      const emptyDatePlaceholder: string = '[test_emptyDatePlaceholder]';
      const parsed: string = pipe.transform(null, emptyDatePlaceholder);
      expect(parsed).toBe(emptyDatePlaceholder);
    });

    it('should accept locale-specific value', () => {
      const date: Date = new Date(1999, 10, 10);
      const localeSpecificDate: string = transformDate.format(date, locale, dateFormat);
      expect(pipe.transform(localeSpecificDate)).toBe(localeSpecificDate);
    });
  });

  describe('with other locales', () => {
    const locales: string[] = Object.keys(localesConfig)
      .filter(locale => locale !== DEFAULT_LOCALE);

    it('self-test', () => {
      expect(locales.length).toBeGreaterThan(0);
    });

    locales.forEach(locale => {
      describe(`with "${locale}" locale`, () => {
        beforeEach(() => setupPipeFor(locale));

        it('should create the pipe and check date format', () => {
          expect(pipe).toBeTruthy();

          const date: Date = new Date(1999, 10, 10);

          const parsed: string = pipe.transform(date);
          const formatted: string = transformDate.format(date, locale, dateFormat);
          expect(parsed).toBe(formatted);

          const localeSpecificDate: string = transformDate.format(date, locale, dateFormat);
          const transformedDate: string = pipe.transform(localeSpecificDate);
          expect(transformedDate).toBe(localeSpecificDate);
        });
      });
    });
  });

  afterAll(() => {
    document.documentElement.lang = DEFAULT_LANG;
  });
});
