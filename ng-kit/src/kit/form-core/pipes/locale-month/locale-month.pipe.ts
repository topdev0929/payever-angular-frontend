import { Inject, Pipe } from '@angular/core';

import { LocaleConstantsService } from '../../../i18n';
import { FORM_DATE_ADAPTER } from '../../constants';
import { DateAdapterInterface } from '../../interfaces';
import { TransformDateService } from '../../services';
import { LocaleDateFormatPipeAbstract } from '../abstract';

@Pipe({
  name: 'peLocaleMonth'
})
export class LocaleMonthPipe extends LocaleDateFormatPipeAbstract  {

  constructor(
    @Inject(FORM_DATE_ADAPTER) protected formDateAdapter: DateAdapterInterface,
    protected transformDateService: TransformDateService,
    protected localeConstantsService: LocaleConstantsService,
  ) {
    super();
  }

  protected get dateFormat(): string {
    return this.localeConstantsService.getDateMonthFormatShortMoment();
  }
}
