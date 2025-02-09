import { PebRenderElementModel, PebViewPage } from "@pe/builder/core";

export class PebViewPageScrollReadyAction {
  static readonly type = '[PEB/View] Page Scroll Ready';

  constructor(
    public containerKey: string,
    public rootElement: HTMLElement,
  ) {
  }
}

export class PebViewPagesSetAction {
  static readonly type = '[PEB/View] Pages Set';
  constructor(
    public pages: PebViewPage[],
  ) {
  }
}

export class PebViewPagesPatchAction {
  static readonly type = '[PEB/View] Pages Patch';
  constructor(
    public updates: ({ id: string } & Partial<PebViewPage>)[],
  ) {
  }
}

export class PebViewPageSetAction {
  static readonly type = '[PEB/View] Page Set';
  constructor(
    public pageId: string | undefined,
  ) {
  }
}

export class PebViewPageRenderingAction {
  static readonly type = '[PEB/View] Page Rendering';

  constructor(
    public elements: { [id: string]: PebRenderElementModel },
  ) {
  }
}

export class PebViewPageLeavingAction {
  static readonly type = '[PEB/View] Page Leaving';
}

export class PebViewPageScrollAction {
  static readonly type = '[PEB/View] Page Scroller';

  constructor(public event: { top: number; height: number }) {
  }
}

export class PebViewSetFocusedSectionAction {
  static readonly type = '[PEB/View] Sect Focused Section';

  constructor(public sectionId: string) {
  }
}

export class PebViewResetContainerAction {
  static readonly type = '[PEB/View] Reset Container';
}

export class PebViewResetAction {
  static readonly type = '[PEB/View] Reset';
}

