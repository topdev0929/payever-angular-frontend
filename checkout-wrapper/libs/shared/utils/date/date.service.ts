import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class DateUtilService {
  fixDate(date: Date | string): string {
    if (date instanceof Date) {
      const iso: string = dayjs(date).toISOString();

      return iso.split('T')[0] + 'T00:00:00.000+00:00';
    }

    if (!dayjs(date).isValid()) {
      return '';
    }

    return date
      ? date.includes('T')
        ? date.split('T')[0] + 'T00:00:00.000+00:00'
        : new Date(date).toISOString()
      : '';
  }
}
