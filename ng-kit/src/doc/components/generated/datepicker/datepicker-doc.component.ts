import { Component } from '@angular/core';

@Component({
  selector: 'doc-datepicker',
  templateUrl: 'datepicker-doc.component.html',
  styleUrls: ['../../../../../node_modules/@angular/material/prebuilt-themes/indigo-pink.css'],
})
export class DatepickerDocComponent {
  datepickerDefaultExampleTemplate: string = require('!!raw-loader!./examples/datepicker-default-example/datepicker-default-example.component.html');
  datepickerDefaultExampleComponent: string = require('!!raw-loader!./examples/datepicker-default-example/datepicker-default-example.component.ts');

  datepickerMonthExampleTemplate: string = require('!!raw-loader!./examples/datepicker-month-example/datepicker-month-example.component.html');
  datepickerMonthExampleComponent: string = require('!!raw-loader!./examples/datepicker-month-example/datepicker-month-example.component.ts');
}
