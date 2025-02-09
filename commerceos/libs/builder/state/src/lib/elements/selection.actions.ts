import { PebElement } from '@pe/builder/render-utils';

export class PebSelectAction {
  static readonly type = '[PEB/Selection] Select Elements';

  constructor(public payload: (PebElement | string) | (PebElement | string)[]) {
  }
}

export class PebDeselectAllAction {
  static readonly type = '[PEB/Selection] Deselect All';
}

export class PebOpenGroupAction {
  static readonly type = '[PEB/Selection] Select Group';

  constructor(public payload: string) {
  }
}

export class PebCloseGroupAction {
  static readonly type = '[PEB/Selection] Deselect Group';
}

export class PebSetDocumentAction {
  static readonly type = '[PEB/Selection] Set Document';

  constructor(public document: PebElement) {
  }
}

export class PebSetBBoxELementsAction {
  static readonly type = '[PEB/Selection] Set BBOX Elements';

  constructor(public elements: PebElement[]) {
  }
}

export class PebSetAllELementsAction {
  static readonly type = '[PEB/Selection] Set All Elements';

  constructor(public elements: PebElement[]) {
  }
}


export class PebPatchBBoxELementsAction {
  static readonly type = '[PEB/Selection] Patch BBOX Elements';

  constructor(public elements: PebElement[]) {
  }
}
