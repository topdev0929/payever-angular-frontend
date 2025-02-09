import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(localeData);

import { LocaleConstantsService } from '@pe/checkout/utils';

import { DATE_SETTINGS } from './date-settings.constant';

@Injectable()
export class DayjsDateAdapter extends NativeDateAdapter {
  constructor(
    protected platform: Platform,
    protected localeConstantsService: LocaleConstantsService,
  ) {
    super(localeConstantsService.getLang(), platform);
  }

  private readonly defaultFormats = [
    'DDMMYYYY',
    'MM DD YYYY',
    'DD MM YYYY',
    'DDMMYY',
    'DD MM YY',
    'D M YY',
    'D M YYYY',
    'YYYY MM DD',
    'MM YYYY',
  ];

  private readonly invalidDateStr: string = 'Invalid Date';

  override format(date: Date, displayFormat: string): string {
    return dayjs(date).format(displayFormat);
  }

  override createDate(year: number, month: number, date: number): Date {
    if (month < 0 || month > 11) {
      throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
    }
    if (date < 1) {
      throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
    }
    const result = new Date(new Date(year, month, date).setHours(0, 0, 0, 0));
    if (result.getMonth() != month) {
      throw Error(`Invalid date "${date}" for month with index "${month}".`);
    }

    return dayjs(new Date(year, month, date).setHours(0, 0, 0, 0)).utc(true).toDate();
  }

  override parse(value: string, parseFormat: string): Date | null {
    if (value && !this.isValidString(value, parseFormat)){
      return null;
    }

    let parsed = dayjs.utc(value, parseFormat, true);

    if (!parsed?.isValid()) {
      parsed = this.parseSpecialFormats(value, parseFormat) || this.parseDateStringNative(value);
    }

    return parsed?.isValid() ? parsed.toDate() : null;
  }

  override getFirstDayOfWeek(): number {
    return dayjs().localeData().firstDayOfWeek();
}

  private isValidString(value: string, parseFormat: string): boolean {
    const pattern = DATE_SETTINGS.fullDate.format === parseFormat ?
      DATE_SETTINGS.fullDate.pattern :
      DATE_SETTINGS.shortDate.pattern;

    return value === '' || pattern.test(value);
  }

  private parseDateStringNative(value: string): Dayjs {
    const date: Date = new Date(value);
    if (date.toString() === this.invalidDateStr) {
      return null;
    } else {
      return dayjs.utc(date);
    }
  }

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
      numbers = `0${numbers}`;
    } else if (numbers.length === 5) {
      numbers = `0${numbers[0]} ${numbers.slice(1)}`;
    }

    return numbers;
  }
}
