import { Injectable } from '@angular/core';

// tslint:disable:no-bitwise
@Injectable()
export class PeMessageThemeService {

  setTheme(color: string): string {
    const rgbArr = this.hexToRGBArr(color);
    const newColor = (rgbArr[0] > 80 && rgbArr[1] > 80 && rgbArr[2] > 80) ? 'light' : 'dark';

    return newColor;
  }

  hexToRGBArr(color: string): number[] {
    const colorForParse = color.substr(1, 6);
    const rgb = colorForParse.match(/.{2}/g) || ['00', '00', '00'];
    const r = parseInt(rgb[0], 16);
    const g = parseInt(rgb[1], 16);
    const b = parseInt(rgb[2], 16);

    return [r, g, b];
  }

  adjustBrightness(color: string, amt: number): string {
    let rgbArr = this.hexToRGBArr(color);
    rgbArr = rgbArr.map(item => Math.max(0, Math.min(255, item + amt)));
    const newColor = rgbArr[1] | (rgbArr[2] << 8) | (rgbArr[0] << 16);

    return `#${newColor.toString(16)}`;
  }
}
