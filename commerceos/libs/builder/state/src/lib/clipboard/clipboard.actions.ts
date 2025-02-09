import { PebEditorPoint, PebElementDef } from '@pe/builder/core';

export class PebCopyElementsAction {
  static readonly type = '[PEB/Editor] Copy Elements';
}

export class PebSetClipboardElements {
  static readonly type = '[PEB/Editor] Set Clipboard Elements';

  constructor(public payload: PebElementDef[]) {
  }
}

export class PebPasteElementsAction {
  static readonly type = '[PEB/Editor] Paste Elements';

  constructor(public position?: PebEditorPoint) {
  }
}
