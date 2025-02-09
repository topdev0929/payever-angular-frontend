import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from '../../services';

@Pipe({
  name: 'translate',
  pure: true
})
export class TranslatePipe implements PipeTransform {

  constructor(public ts: TranslateService) { }

  public transform(key: string, params?: any): string {
    return this.ts.translate(key, params);
  }
}
