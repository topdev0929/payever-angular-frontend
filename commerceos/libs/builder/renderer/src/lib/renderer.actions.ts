import { PebViewElement, PebViewStyle } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';



export class PebViewSetAction {
  static readonly type = '[Peb/View] Set Elements';

  constructor(public payload: Array<PebViewElement<PebViewStyle>>) {
  }
}

export class PebViewUpdateAction {
  static readonly type = '[Peb/View] Update Elements';

  constructor(public payload: Array<PebViewElement<PebViewStyle>>) {
  }
}

export class PebViewClearAction {
  static readonly type = '[Peb/View] Clear Elements';
}


export class PebViewChangedAction {
  static readonly type = '[Peb/View] Changed Elements';

  constructor(public payload: PebElement[]) {
  }
}

export class PebViewPatchAction {
  static readonly type = '[Peb/View] Patch Elements';

  constructor(public payload: Array<Pick<PebViewElement, 'id'> & Partial<PebViewElement>>) {
  }
}

export class PebRevertViewPatchAction {
  static readonly type = '[Peb/View] Revert View Element';

  constructor(public elements: PebElement[]) {
  }
}

export class PebViewDeleteAction {
  static readonly type = '[Peb/View] Delete Elements';

  constructor(public payload: string[]) {
  }
}

export class PebUpdateViewBBoxAction {
  static readonly type = '[Peb/View] Update View BBox';

  constructor(
    public updates: { [id: string]: { width: number; height: number } },
  ) {
  }
}

export class PebQueryViewBBoxAction {
  static readonly type = '[Peb/View] Query View BBox';
  constructor(public elementIds: string[] | undefined) {
  }
}

export type PebViewAction = PebViewUpdateAction | PebViewPatchAction | PebViewDeleteAction;
