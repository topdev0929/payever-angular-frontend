import { DEFAULT_DATE_INTERNAL_FORMAT, DEFAULT_DATE_LOCALE } from '../constants';
import { DateAdapterInterface } from '../interfaces';
import { TransformDateService } from '../services';

export class GenericDateAdapter implements DateAdapterInterface {

  private dateFormat: string = DEFAULT_DATE_INTERNAL_FORMAT;
  private locale: string = DEFAULT_DATE_LOCALE;

  constructor(private transformDateService: TransformDateService) {
  }

  format(date: Date): string {
    return this.transformDateService.format(date, this.locale, this.dateFormat);
  }

  parse(value: string): Date | null {
    return this.transformDateService.parse(value, this.dateFormat);
  }
}
