import { PebUndoItem, PebUndoStateModel } from "./undo";

export class PebUndoSet {
  static readonly type = '[PEB/Undo] Set';

  constructor (public payload: PebUndoStateModel) {
  }
}

export class PebUndoPrepend {
  static readonly type = '[PEB/Undo] Prepend';

  constructor (public items: PebUndoItem[]) {
  }
}

export class PebUndoAppend {
  static readonly type = '[PEB/Undo] Append';

  constructor (public items: PebUndoItem[]) {
  }
}
