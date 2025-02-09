import { Pipe, PipeTransform } from '@angular/core';
import { kebabCase } from 'lodash';

const WEBKIT_FIX = ['backdrop-filter'];

@Pipe({ name: 'pebStyle' })
export class PebStylePipe implements PipeTransform {

  transform(value: { [key: string]: string }) {
    const css = {};

    Object.keys(value).forEach((key) => {
      css[kebabCase(key)] = value[key];
    });

    WEBKIT_FIX.forEach((key) => {
      const val = css[key];
      if (val !== undefined) {
        css[`-webkit-${key}`] = val;
      }
    });

    return css;
  }
}
