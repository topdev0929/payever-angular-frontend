import { TransformDateService } from './transform-date.service';
import { getLang } from '../../../i18n';

describe('TransformDateService', () => {
  let service: TransformDateService;
  let locale: string;

  beforeEach(() => {
    service = new TransformDateService();
    locale = getLang({});
  });

  describe('.format()', () => {
    it('should format time', () => {
      const value: Date = new Date(1999, 11, 30, 5, 5, 5);
      let format: string;

      format = 'HH MM.YYYY';
      expect(service.format(value, locale, format)).toBe('05 12.1999');

      format = 'DD.MM.YYYY';
      expect(service.format(value, locale, format)).toBe('30.12.1999');

      format = 'DD/MM/YY';
      expect(service.format(value, locale, format)).toBe('30/12/99');

      format = 'MM/DD/YY';
      expect(service.format(value, locale, format)).toBe('12/30/99');
    });

    it('should not format invalid time', () => {
      expect(service.format(new Date('100% invalid date value'), locale, '')).toBe('');
    });

    it('should accept no formatting and perform default format', () => {
      const date: Date = new Date(1999, 10, 30, 5, 5, 5, 5);
      expect(service.format(date, locale, '')).toContain('1999-11-30T05:05:05');
    });

    it('should format time with different UTC offsets', () => {
      expect(service.format(new Date('2000-11-10T00:02:00Z'), locale, 'DD MM YYYY')).toBe('10 11 2000');
      expect(service.format(new Date('2000-11-05T02:00:00-23:23'), locale, 'DD MM YYYY')).toBe('06 11 2000');
      expect(service.format(new Date('2000-11-05T02:02:00+23:23'), locale, 'DD MM YYYY')).toBe('04 11 2000');
    });
  });

  describe('.parse()', () => {
    it('should parse valid time via .toString()', () => {
      const date: Date = new Date(1999, 10, 10);
      expect(service.parse(date.toString(), 'DD.MM.YYYY').toString()).toBe(date.toString());
    });

    it('should accept ISO 8601 formatted string via .toISOString()', () => {
      const date: Date = new Date(1999, 10, 10);
      expect(service.parse(date.toISOString(), 'DD.MM.YYYY').toISOString()).toBe(date.toISOString());
    });

    it('should accept UTC formatted string via .toUTCString()', () => {
      const date: Date = new Date(1999, 10, 10);
      expect(service.parse(date.toUTCString(), 'DD.MM.YYYY').toISOString()).toBe(date.toISOString());
    });

    it('should not parse invalid value', () => {
      spyOn(console, 'warn');
      expect(service.parse('Invalid date', '')).toBeNull();
      // tslint:disable-next-line no-console
      expect(console.warn).toHaveBeenCalledTimes(1); // expect warning from moment.js parser
    });

    it('shuold accept special formats', () => {
      expect(service.parse('10.11.2000', 'DD.MM.YYYY').toISOString()).toBe('2000-11-10T00:00:00.000Z', 'DD.MM.YYYY format');
      expect(service.parse('10/11/2000', 'MM/DD/YYYY').toISOString()).toBe('2000-10-11T00:00:00.000Z', 'MM/DD/YYYY format');
      expect(service.parse('10/11/2000', 'DD/MM/YYYY').toISOString()).toBe('2000-11-10T00:00:00.000Z', 'DD/MM/YYYY format');
      expect(service.parse('10-11-2000', 'DD-MM-YYYY').toISOString()).toBe('2000-11-10T00:00:00.000Z', 'DD-MM-YYYY format');
      expect(service.parse('10 11 2000', 'DD MM YYYY').toISOString()).toBe('2000-11-10T00:00:00.000Z', 'DD MM YYYY format');
      expect(service.parse('13  11  2000', 'DD MM YYYY').toISOString()).toBe('2000-11-13T00:00:00.000Z', 'DD MM YYYY format');
      expect(service.parse('11.2000', 'MM.YYYY').toISOString()).toBe('2000-11-01T00:00:00.000Z', 'MM.YYYY format');
      expect(service.parse('11 2000', 'MM YYYY').toISOString()).toBe('2000-11-01T00:00:00.000Z', 'MM YYYY format');
      expect(service.parse('11  2000', 'MM YYYY').toISOString()).toBe('2000-11-01T00:00:00.000Z', 'MM YYYY format');
      expect(service.parse('11  2000', 'MM  YYYY').toISOString()).toBe('2000-11-01T00:00:00.000Z', 'MM  YYYY format');
      expect(service.parse('11 / 2000', 'MM/YYYY').toISOString()).toBe('2000-11-01T00:00:00.000Z', 'MM/YYYY format');
      expect(service.parse('11 / 2000', 'MM / YYYY').toISOString()).toBe('2000-11-01T00:00:00.000Z', 'MM / YYYY format');
      expect(service.parse('11-2000', 'MM-YYYY').toISOString()).toBe('2000-11-01T00:00:00.000Z', 'MM-YYYY format');
      expect(service.parse('6-1988', 'MM-YYYY').toISOString()).toBe('1988-06-01T00:00:00.000Z', 'MM-YYYY format');
      expect(service.parse('06-1988', 'MM-YYYY').toISOString()).toBe('1988-06-01T00:00:00.000Z', 'MM-YYYY format');
      expect(service.parse('6 1988', 'M-YYYY').toISOString()).toBe('1988-06-01T00:00:00.000Z', 'M-YYYY format');
      expect(service.parse('61988', 'MYYYY').toISOString()).toBe('1988-06-01T00:00:00.000Z', 'MYYYY format');
      expect(service.parse('6 88', 'M YY').toISOString()).toBe('1988-06-01T00:00:00.000Z', 'M YY format');
      expect(service.parse('06 88', 'MM YY').toISOString()).toBe('1988-06-01T00:00:00.000Z', 'MM YY format');
      expect(service.parse('4 06 88', 'D MM YY').toISOString()).toBe('1988-06-04T00:00:00.000Z', 'D MM YY format');
      expect(service.parse('04 06 88', 'DD MM YY').toISOString()).toBe('1988-06-04T00:00:00.000Z', 'DD MM YY format');
    });

    it('should accept different UTC offsets', () => {
      expect(service.parse('2000-11-11T00:02:00Z', '').toISOString()).toBe('2000-11-11T00:02:00.000Z');
      expect(service.parse('2000-11-11T00:02:00-03:23', '').toISOString()).toBe('2000-11-11T03:25:00.000Z', 'ISO 8061 -03:23');
      expect(service.parse('2000-11-11T00:02:00+03:23', '').toISOString()).toBe('2000-11-10T20:39:00.000Z', 'ISO 8061 +03:23');
    });
  });
});
