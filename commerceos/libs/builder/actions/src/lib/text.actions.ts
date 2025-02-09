import Delta from 'quill-delta';

import { PebTextStyles } from '@pe/builder/core';

export class PebTextSelectionChangedAction {
  static readonly type = '[Peb/Text] Selection Changed';

  constructor(public payload: [Delta, { index: number; length: number }]) {
  }
}

export class PebUpdateTextStyleAction {
  static readonly type = '[Peb/Text] Update Text Style';

  constructor(
    public payload: Partial<PebTextStyles>,
    public submit: boolean,
  ) {
  }
}


