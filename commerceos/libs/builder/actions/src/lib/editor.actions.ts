import { PebEditorPatchMode } from '@pe/builder/core';

export class PebGroupAction {
  static readonly type = '[PEB/Editor] Group';
}

export class PebUngroupAction {
  static readonly type = '[PEB/Editor] Ungroup';
}

export class PebCreateEmptyPageAction {
  static readonly type = '[PEB/Editor] Create Empty Page';

  constructor(public payload: {
    isMaster?: boolean,
    masterPage?: string,
  } = {}) {
  }
}

export class PebCreateEmptyThemeAction {
  static readonly type = '[PEB/Editor] Create Empty Theme';
}

export class PebCreateEmptyThemeSuccessAction {
  static readonly type = '[PEB/Editor] Create Empty Theme Success';
}

export class PebRenderPebElementsAction {
  static readonly type = '[PEB/Editor] Render PebElements';
}

export class PebSetRenderPatchModeAction {
  static readonly type = '[PEB/Editor] Set Render Patch Mode';

  constructor(public mode: PebEditorPatchMode | undefined) {
  }
}
