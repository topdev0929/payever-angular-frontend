import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'peMaskLeft' })
export class MaskLeftPipe implements PipeTransform {
  transform(valueParam: string, sizeRight = 4, maskChar = '*'): string {
    let value = valueParam;
    if (value) {
      const left: string = value.slice(0, sizeRight ? -sizeRight : value.length);
      const right: string = value.slice(sizeRight ? -sizeRight : value.length);
      value = left.replace(/[0-9a-z]/ig, maskChar) + right;
    }

    return value;
  }
}
