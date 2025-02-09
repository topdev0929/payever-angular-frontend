import { PebRenderElementModel, PebRenderUpdateModel, PebViewStyle } from '@pe/builder/core';


export class PebRenderSetRootElementAction {
  static readonly type = '[PEB/View] Render Set';

  constructor(
    public rootELementId: string | undefined,
  ) {
  }
}

export class PebRenderResetAction {
  static readonly type = '[PEB/View] Render Reset';
}

export class PebRenderPatchStyleAction {
  static readonly type = '[PEB/View] Render Patch Style';

  constructor(
    public id: string,
    public style: Partial<PebViewStyle>,
  ) {
  }
}

export class PebRenderCreateOrUpdateAction {
  static readonly type = '[PEB/View] Render Create';

  constructor(public elements: PebRenderElementModel[]) {
  }
}

export class PebRenderSetParentAction {
  static readonly type = '[PEB/View] Render Set Parent';

  constructor(
    public elementId: string,
    public parentId: string,
  ) {
  }
}

export class PebRenderUpdateAction {
  static readonly type = '[PEB/View] Render Update Elements';

  constructor(
    public updates: (PebRenderUpdateModel | undefined)[],
  ) {
  }
}

export class PebRenderChangeParentAction {
  static readonly type = '[PEB/View] Render Change Parent';

  constructor(
    public elementId: string,
    public newParentId: string,
  ) {
  }
}
