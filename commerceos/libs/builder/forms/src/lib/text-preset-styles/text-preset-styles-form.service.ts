import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';

import { PebDefaultTextStyles, PebTextStyles } from '@pe/builder/core';

import { PebTextPresetStyle, pebPresetTextStyles } from './constants';

@Injectable()
export class PebTextPresetStylesFormService {
  getPresetStyles(): PebTextPresetStyle[] {
    return pebPresetTextStyles;
  }

  getPresetStyle(presetStyleName: string): Partial<PebTextStyles> {
    return this.getPresetStyles().find(style => style.name === presetStyleName)?.styles ?? {};
  }

  isPresetStyleUnchanged(presetStyleName: string, style: Partial<PebTextStyles>): boolean {
    const preset = this.getPresetStyle(presetStyleName);

    if (!preset || !style) {
      return true;
    }

    style = { ...PebDefaultTextStyles, ...style };

    for (const key in preset) {
      if (!isEqual(preset[key], style[key])) {
        return false;
      }
    }

    return true;
  }
}
