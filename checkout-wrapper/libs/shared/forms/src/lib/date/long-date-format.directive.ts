import { Directive } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import { DATE_SETTINGS, dateFormat } from './date-settings.constant';
import { DayjsDateAdapter } from './dayjs-date-adapter.class';

@Directive({
  selector: '[longDateFormat]',
  providers: [
    {
      provide: DateAdapter,
      useClass: DayjsDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useFactory: () =>
        dateFormat(DATE_SETTINGS.fullDate.format),
    },
  ],
})
export class LongDateFormatDirective {}
