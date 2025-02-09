import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

interface DateFormatParamsInterface {
  inputFormat?: string;
  format?: string;
  subtract?: number;
  subtractUnit?: string;
}

@Pipe({
  name: 'dateFormat',
  pure: false
})
export class DateFormatPipe implements PipeTransform {

  transform(value?: string, params?: DateFormatParamsInterface): string {
    let date: any;
    let inputFormat: string;
    let format: string;
    let subtract: number;
    let subtractUnit: string;
    if ( params ) {
      inputFormat = params.inputFormat;
      format = params.format;
      subtract = params.subtract;
      subtractUnit = params.subtractUnit;
    }
    if ( value ) {
      date = inputFormat ? moment(value, inputFormat) : moment(value);
    } else {
      date = moment();
    }
    if ( subtract ) {
      date = date.subtract(subtract, subtractUnit);
    }
    return date.format(format);
  }
}
