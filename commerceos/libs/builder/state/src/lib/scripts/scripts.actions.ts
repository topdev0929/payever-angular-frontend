import { PebScript } from '@pe/builder/core';

export class PebResetScriptsAction {
  static readonly type = '[PEB/Script] Reset';
}

export class PebSetScriptsAction {
  static readonly type = '[PEB/Script] Set';

  constructor(public payload: PebScript[]) {
  }
}

export class PebUpdateScriptsAction {
  static readonly type = '[PEB/Script] Update';

  constructor(public payload: PebScript | PebScript[]) {
  }
}

export class PebDeleteScriptsAction {
  static readonly type = '[PEB/Script] Delete';

  constructor(public payload: string | string[]) {
  }
}
