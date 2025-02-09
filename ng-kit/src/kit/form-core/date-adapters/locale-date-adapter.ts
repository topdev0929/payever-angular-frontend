import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';

import { TransformDateService } from '../services';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_LOCALE } from '../constants';

@Injectable()
export class LocaleDateAdapter extends NativeDateAdapter {

  dateFormat: string = DEFAULT_DATE_FORMAT;

  constructor(
    platform: Platform,
    private transformDateService: TransformDateService,
  ) {
    super(DEFAULT_DATE_LOCALE, platform);
  }

  format(date: Date, displayFormat: string): string {
    if (displayFormat === 'input') {
      return this.transformDateService.format(date, this.locale, this.dateFormat);
    } else {
      return super.format(date, displayFormat);
    }
  }

  parse(value: any): Date | null {
    return this.transformDateService.parse(value, this.dateFormat);
  }
}
