import Delta from 'quill-delta';

import {
  PebElementType,
  PebValueByScreen,
  PebValueByLanguage,
  PEB_ROOT_SCREEN_KEY,
  PebLanguageEnum,
  PebElementDefData,
  PEB_DEFAULT_LANG_KEY,
} from '@pe/builder/core';
import { PebQuillRenderer } from '@pe/builder/delta-renderer';

export const PEB_LANGUAGE_QUERY_PARAM = 'lang';

export const getDeltaByLanguage = (
  type: PebElementType,
  text: PebValueByScreen<PebValueByLanguage<Delta>> | undefined,
  languageKey: string,
): Delta | undefined => {

  if (!text || !type || [PebElementType.Document, PebElementType.Section, PebElementType.Grid].includes(type)) {
    return undefined;
  }

  /**
   * Next places should be checked in the order:
   * - data.text[screen][language]
   * - data.text[screen][PebLanguage.Generic]
   * - data.text[PebScreen.Desktop][language]
   * - data.text[PebScreen.Desktop][PebLanguage.Generic]
   */

  const screenText = text[PEB_ROOT_SCREEN_KEY] ?? text[PEB_ROOT_SCREEN_KEY];

  if (!text) {
    return undefined;
  }

  const languageText = screenText ? screenText[languageKey] ?? screenText[PebLanguageEnum.Generic] : undefined;

  if (!languageText) {
    return undefined;
  }

  if (languageText.ops && languageText.ops[0]?.insert === '\n') {
    return new Delta([{ insert: '' }, ...languageText.ops]);
  }

  return text ? new Delta(languageText) : undefined;
};

export const getText = (
  elm: { type: PebElementType, data?: PebElementDefData },
  languageKey: string = PebLanguageEnum.Generic,
): string | undefined => {

  if (!elm.type || [PebElementType.Document, PebElementType.Section, PebElementType.Grid].includes(elm.type)) {
    return undefined;
  }

  const deltaText = getDeltaByLanguage(elm.type, elm.data?.text, languageKey);
  const text = deltaText && !deltaIsEmpty(deltaText) ? PebQuillRenderer.render(deltaText) : '';

  return text;
};

const deltaIsEmpty = (delta: Delta): boolean => {
  return delta.ops.every(op => !op.insert || op.insert === '\n');
};

export function getPageLanguage (
  themDefault?: string,
  pageDefault?: string,
  queryLang?: string
): string {
  return queryLang
  || pageDefault
  || themDefault
  || PEB_DEFAULT_LANG_KEY;
}
