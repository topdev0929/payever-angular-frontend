import { PebElementStyles } from '@pe/builder/core';

import { PebElement } from '../models';


export interface PebVectorStylesResult {
  host?: Partial<PebElementStyles>;
  inner?: Partial<PebElementStyles>;
  css?: Partial<CSSStyleDeclaration>;
}

export type PebVectorEnabledElement = Pick<PebElement, 'id' | 'styles' | 'data'>;
