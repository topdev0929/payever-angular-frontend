import { PipeTransform } from '@angular/core';

import { LocaleConstantsService } from '../../../i18n';
import { DateAdapterInterface } from '../../interfaces';
import { TransformDateService } from '../../services';

export abstract class LocaleDateFormatPipeAbstract implements PipeTransform {

  protected defaultEmptyPlaceholder: string = '---';
  protected abstract formDateAdapter: DateAdapterInterface;
  protected abstract transformDateService: TransformDateService;
  protected abstract localeConstantsService: LocaleConstantsService;

  transform(value: string | Date, emptyDatePlaceholder?: string): string {
    let parsed: Date;

    if (typeof value === 'string') {
      parsed = this.formDateAdapter.parse(value);
    } else if (value instanceof Date) {
      parsed = value;
    }
    return parsed && this.transformDateService.format(parsed, this.lang, this.dateFormat) ||
      emptyDatePlaceholder ||
      this.defaultEmptyPlaceholder;
  }

  protected get dateFormat(): string {
    return this.localeConstantsService.getDateFormatShortMoment();
  }

  protected get lang(): string {
    return this.localeConstantsService.getLang();
  }
}
