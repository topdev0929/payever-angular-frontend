export class PebUndoAction {
  static readonly type = '[PEB/Undo] Undo';
}

export class PebRedoAction {
  static readonly type = '[PEB/Undo] Redo';
}

export class PebLoadUndoAction {
  static readonly type = '[PEB/Undo] Load';

  constructor(
    public offset: number,
    public limit: number
  ) {
  }
}

export class PebResetUndoAction {
  static readonly type = '[PEB/Undo] Reset';
}
