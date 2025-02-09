import { Pipe, PipeTransform } from '@angular/core';

import { isEqualRGBA, isRGBA, RGB, RGBA } from '@pe/builder/core';

@Pipe({ name: 'isSameColor' })
export class PebIsSameColorPipe implements PipeTransform {
  transform(color1: RGB | RGBA, color2: RGB | RGBA): boolean {
    return isEqualRGBA(color1, color2);
  }
}

@Pipe({ name: 'rgbCss' })
export class PebRGBCssPipe implements PipeTransform {
  transform(color: RGB | RGBA): string {
    const a = isRGBA(color) ? color.a : 1;

    return `rgba(${color.r}, ${color.g}, ${color.b}, ${a})`;
  }
}
