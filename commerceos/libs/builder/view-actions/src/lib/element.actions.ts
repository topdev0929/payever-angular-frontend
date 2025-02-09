import { PebRenderElementModel } from '@pe/builder/core';

export class PebViewElementInitAction {
  static readonly type = '[PEB/View] Element Init';

  constructor(
    public element: PebRenderElementModel,
    public containerKey: string,
    public htmlElement: HTMLElement,
  ) {
  }
}

export class PebViewElementClickedAction {
  static readonly type = '[PEB/View] Element Clicked';

  constructor(
    public element: PebRenderElementModel,
  ) {
  }
}

export class PebViewElementMouseEnteredAction {
  static readonly type = '[PEB/View] Element Mouse Entered';

  constructor(
    public element: PebRenderElementModel,
  ) {
  }
}

export class PebViewElementMouseLeavedAction {
  static readonly type = '[PEB/View] Element Mouse Leaved';

  constructor(
    public element: PebRenderElementModel,
  ) {
  }
}

export class PebViewElementEnteredViewportAction {
  static readonly type = '[PEB/View] Element Entered Viewport';

  constructor(
    public element: PebRenderElementModel,
  ) {
  }
}

export class PebViewElementExitedViewportAction {
  static readonly type = '[PEB/View] Element Exited Viewport';

  constructor(
    public element: PebRenderElementModel,
  ) {
  }
}

export class PebViewElementScrollIntoViewAction {
  static readonly type = '[PEB/View] Element Scroll Into View';

  constructor(public element: PebRenderElementModel) {
  }
}

export class PebViewElementScrollToTopAction {
  static readonly type = '[PEB/View] Element Scroll TO Top';
}

