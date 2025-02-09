import { PebCursorMode, PebElementDef, PebViewElementEventType } from '@pe/builder/core';

import { PebElement } from '../models';


export function getCursorCssStyles(elm: PebElement | PebElementDef): Partial<CSSStyleDeclaration> {
  if (elm.styles.cursor) {
    return { cursor: `${elm.styles.cursor}` };
  }

  if (elm.integration?.actions?.click) {
    return { cursor: PebCursorMode.Pointer };
  }

  if (elm.link?.type) {
    return { cursor: PebCursorMode.Pointer };
  }

  if (
    elm.interactions &&
    Object.values(elm.interactions).some(item =>
      item.trigger === PebViewElementEventType.Click ||
      item.trigger === PebViewElementEventType.MouseEnter)
  ) {
    return { cursor: PebCursorMode.Pointer };
  }

  return {};
}

