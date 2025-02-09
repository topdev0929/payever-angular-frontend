import { PebLanguage, PebScreen } from '@pe/builder/core';

import { PebOptionsStateModel } from './options.state';


export class PebSetOptionsAction {
  static readonly type = '[Peb/Editor] Set Options';

  constructor(public payload: Partial<PebOptionsStateModel>) {
  }
}

export class PebSetLanguageAction {
  static readonly type = '[Peb/Editor] Set Language';

  constructor(public payload: PebLanguage) {
  }
}

export class PebSetScaleAction {
  static readonly type = '[Peb/Editor] Set Scale';

  constructor(public payload: {
    scale?: number,
    scaleToFit?: boolean,
  }) {
  }
}

export class PebSetScreenAction {
  static readonly type = '[Peb/Editor] Set Screen';

  constructor(public payload: PebScreen) {
  }
}

export class PebSetDefaultScreenAction {
  static readonly type = '[Peb/Editor] Set Default Screen';

  constructor(public payload: PebScreen) {
  }
}
