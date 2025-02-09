import Delta from 'quill-delta';

import { PebElementStyles, PebLink } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

export interface PebContextRendererResult {
  styles?: Partial<PebElementStyles>;
  text?: Delta;
  invisible?: boolean;
  link?: PebLink;
}

export type PebContextEnabledElement = Pick<PebElement, 'id' | 'integration' | 'styles' | 'text' | 'link'>;
