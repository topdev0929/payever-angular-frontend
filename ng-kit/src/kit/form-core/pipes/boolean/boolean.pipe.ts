import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from '../../../i18n';

@Pipe({ name: 'peBoolean' })
export class BooleanPipe implements PipeTransform {

  constructor(
    private translateService: TranslateService
  ) {}

  transform(value?: boolean): string {
    return this.translateService.translate(
      value ? 'ng_kit.forms.labels.yes' : 'ng_kit.forms.labels.no'
    );
  }

}
