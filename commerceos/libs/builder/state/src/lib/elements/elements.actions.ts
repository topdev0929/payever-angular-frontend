import { BBox } from 'rbush';

import { PebEditorPoint, PebElementDef, PebElementDefUpdate, PebSyncUpdateOption } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

export class PebResetElementsAction {
  static readonly type = '[PEB/Element] Reset';
}

export class PebInsertAction {
  static readonly type = '[PEB/Element] Insert';

  constructor(
    public elements: PebElementDef[],
    public options: { selectInserted?: boolean; editText?: boolean; sync?: boolean },
  ) {
  }
}

export class PebMoveAction {
  static readonly type = '[PEB/Element] Move';

  constructor(
    public elements: PebElement[],
    public parent: PebElement,
    public translate: { moveX: number, moveY: number },
    public dropPoint?: PebEditorPoint,
  ) {
  }
}


export class PebResizeAction {
  static readonly type = '[PEB/Element] Resize';

  constructor(
    public elements: PebElement[],
    public initialBBox: BBox,
    public finalBBox: BBox,
  ) {
  }
}

export class PebSyncAction {
  static readonly type = '[PEB/Element] Sync Elements';

  constructor(
    public elements: PebElement[],
    public updates: PebSyncUpdateOption,
  ) {
  }
}

export class PebUpsertAction {
  static readonly type = '[PEB/Element] Add';

  constructor(public payload: { elements: any[], pageId: string }) {
  }
}

export class PebArrangeElementsAction {
  static readonly type = '[PEB/Element] Arrange';

  constructor(public elements: PebElement | PebElement[], public delta: number) {
  }
}

export class PebClearStylesAction {
  static readonly type = '[PEB/Element] Clear Styles';
}

export class PebUpdateAction {
  static readonly type = '[PEB/Element] Update';

  constructor(public payload: PebUpdateActionPayload) {
  }
}

export class PebUpdateElementDefAction {
  static readonly type = '[PEB/Element] Update Element Def';

  constructor(public updates: PebElementDefUpdate[]) {
  }
}

export class PebDeleteAction {
  static readonly type = '[PEB/Element] Delete';

  constructor(public payload: PebElement[]) {
  }
}

export class PebBringFrontAction {
  static readonly type = '[PEB/ZIndex] Bring Front';
}

export class PebSendBackAction {
  static readonly type = '[PEB/ZIndex] Send Back';
}

export type PebUpdateActionPayload = Array<Pick<PebElement, 'id'> & Partial<PebElement>>;

