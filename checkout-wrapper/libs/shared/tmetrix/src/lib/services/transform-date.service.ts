import { Injectable } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

@Injectable({
  providedIn: 'root',
})
export class TransformDateService {

  private readonly defaultFormats: ReadonlyArray<string> = Object.freeze(
    ['DDMMYYYY', 'DD MM YYYY', 'MM YYYY', 'DDMMYY', 'DD MM YY', 'D M YY', 'D M YYYY']
  );

  private readonly invalidDateStr: string = 'Invalid Date';

  format(date: Date, locale: string, dateFormat: string): string {
    const parsed: Dayjs = dayjs(date);
    parsed.locale(locale);

    return parsed.isValid() ? parsed.format(dateFormat) : '';
  }

  parse(value: string, dateFormat: string): Date | null {
    // NOTE: Used UTC parser here, because `dayjs()` not working properly -
    // for any input cases like '10-11-2000' for value and 'DD-MM-YYYY' for dateFormat
    // it adds UTC offsets on different mahines for unknown reason.
    let parsed: Dayjs = dayjs.utc(value, dateFormat, true);
    if (!parsed?.isValid()) {
      parsed = this.parseSpecialFormats(value, dateFormat) || this.parseDateStringNative(value);
    }

    return parsed?.isValid() ? this.momentToDate(parsed) : null;
  }

  private momentToDate(parsed: Dayjs): Date {
    return new Date(parsed.year(), parsed.month(), parsed.date());
  }

  private parseDateStringNative(value: string): Dayjs {
    const date: Date = new Date(value);
    if (date.toString() === this.invalidDateStr) {
      return null;
    } else {
      return dayjs.utc(date);
    }
  }

  // Here we transform all following values into single format:
  //  11.11.2000, 11 11 2000, 11/11/2000,  11 / 11 / 2000, 11-11-2000 -> 11 11 2000
  //  11.2000, 11 2000, 11/2000, 11 / 2000, 11-2000 -> 11 2000
  //  Also we allow format like 11112000, but do not allow 112000 because it triggers parser too early
  private parseSpecialFormats(value: string, dateFormat: string): Dayjs {
    const normalizedValue: string = this.normalizeValue(value);

    let parsed: Dayjs;
    for (const format of this.getFormats(dateFormat)) {
      parsed = dayjs.utc(normalizedValue, format, true);
      if (parsed?.isValid()) {
        return parsed;
      }
    }

    return null;
  }

  // MMYYYY We handle in very specific case
  private getFormats(dateFormat: string): string[] {
    const formats: string[] = [...this.defaultFormats];
    if (dateFormat.replace(/[^DMY]/g, '') === 'MMYYYY') {
      formats.unshift('MMYYYY');
    }

    return formats;
  }

  private normalizeValue(value: string): string {
    let numbers: string = (value || '')
      .replace(/\D/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (numbers.length === 6 && numbers.substring(1) === ' ') {
      numbers = `0${numbers}`; // Have to do this because 'M YYYY' doesn't work
    } else if (numbers.length === 5) {
      numbers = `0${numbers[0]} ${numbers.slice(1)}`;
    }

    return numbers;
  }
}
