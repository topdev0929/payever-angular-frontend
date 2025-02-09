import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncating',
})
export class PeTruncatingPipe implements PipeTransform {

  transform(value: string, truncateLength: number): string {
    if (!value) {
      return value;
    }

    if (truncateLength < 0) {
      return value;
    }

    return value.length > truncateLength
      ? value.slice(0, truncateLength - 2) + '...'
      : value
  }
}
