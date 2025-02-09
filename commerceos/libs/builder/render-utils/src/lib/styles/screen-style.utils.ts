import {
  PEB_ELEMENT_BASE_STYLE,
  PebElementStyles,
  PebScreen,
  PebValueByScreen,
} from '@pe/builder/core';

export function getCascadeStylesByWidth(
  styles: PebValueByScreen<Partial<PebElementStyles>> | undefined,
  orderedScreens: PebScreen[], // should be descending by width
  width: number,
  rootScreenKey?: string,
): Partial<PebElementStyles> {
  if (!styles) {
    return {};
  }

  const defaultStyles = PEB_ELEMENT_BASE_STYLE;
  let result: any = rootScreenKey ? { ...defaultStyles, ...styles[rootScreenKey] } : { ...defaultStyles };

  const len = orderedScreens.length;
  for (let i = 0; i < len; i++) {

    const scr = orderedScreens[i];

    if (scr && styles[scr.key]) {
      Object.entries(styles[scr.key]).forEach(([key, value]: [string, Partial<PebElementStyles>]) => {
        if (key === 'textStyles' || key === 'dimension') {
          result[key] = { ...result[key], ...value };
        }
        else {
          result[key] = value;
        }
      });

      if (scr.width <= width) {
        return result;
      }
    }
  }

  return result;
}

export function getScreenBySize(orderedScreens: PebScreen[], width: number) {
  const len = orderedScreens.length;
  for (let i = 0; i < len; i++) {
    const scr = orderedScreens[i];
    if (width >= scr.width) {

      return scr;
    }
  }

  return orderedScreens[len - 1];
}

export function getSortedScreens(screens: PebScreen[]): PebScreen[] {
  return [...screens].sort((a: any, b: any) => b.width - a.width);
}
