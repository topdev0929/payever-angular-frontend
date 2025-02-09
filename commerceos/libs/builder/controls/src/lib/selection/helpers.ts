import { PebElementType } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';


export const getMinElementsDimensions = (elm: PebElement) => {
  switch (elm.type) {
    case PebElementType.Text:
    case PebElementType.Shape:
      return {
        width: 1,
        height: 1,
      };
    case PebElementType.Grid:
      return {
        width: 10,
        height: 10,
      };
    case PebElementType.Section:
      return {
        width: NaN,
        height: 200,
      };
    default:
      return {
        width: 20,
        height: 20,
      };
  }
};
