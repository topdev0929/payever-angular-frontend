import { Directive } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { DATE_SETTINGS, dateFormat } from './date-settings.constant';
import { DayjsDateAdapter } from './dayjs-date-adapter.class';

@Directive({
  selector: '[shortDateFormat]',
  providers: [
    {
      provide: DateAdapter,
      useClass: DayjsDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useFactory: () =>
        dateFormat(DATE_SETTINGS.shortDate.format),
    },
  ],
})
export class ShortDateFormatDirective {}
