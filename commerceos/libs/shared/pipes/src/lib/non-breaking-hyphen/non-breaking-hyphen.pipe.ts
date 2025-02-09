import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nonBreakingHyphen',
})
export class PeNonBreakingHyphenPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    return value.replace(/-/g, '\u2011');
  }
}
