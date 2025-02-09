import { PebPasteTypes } from '@pe/builder/core';

import { isSvg } from './is-svg.utils';

export function detectPasteType(text: string): PebPasteTypes | undefined {
  if (isSvg(text)) {
    return PebPasteTypes.SVG;
  }
  const parsed = tryParseJson(text);

  if (parsed?.source === PebPasteTypes.FigmaPlugin) {
    return PebPasteTypes.FigmaPlugin;
  }

  if (parsed?.elements !== undefined) {
    return PebPasteTypes.ElementDef;
  }

  return undefined;
}

function tryParseJson(text: string): any {
  try {
    return JSON.parse(text);
  }
  catch (ex) {
    return undefined;
  }
}