import { Pipe, PipeTransform } from '@angular/core';

import { FormOptionInterface } from '@pe/checkout/types';

@Pipe({ name: 'peTranslatedFormOptionsLabel' })
export class TranslatedFormOptionsLabelPipe implements PipeTransform {

  transform(
    value: any,
    options: FormOptionInterface[],
    defaultText = '---',
  ): string {
    const option: FormOptionInterface = (options || []).find(item => String(item.value) === String(value));

    return (option?.label || defaultText);
  }
}
