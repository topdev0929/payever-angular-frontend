import { PebPage } from '@pe/builder/core';


export class PebSetPagesAction {
  static readonly type = '[PEB/Page] Set';

  constructor(public pages: PebPage[]) {
  }
}

export class PebUpdatePagesPreview {
  static readonly type = '[PEB/Page] Preview';

  constructor(public page: PebPage) {
  }
}

export class PebUpdatePagesAction {
  static readonly type = '[PEB/Page] Update';

  constructor(public payload: PebPage | PebPage[]) {
  }
}

export class PebDeletePageAction {
  static readonly type = '[PEB/Page] Delete';

  constructor(public pageId: string) {
  }
}

export class PebArrangePagesAction {
  static readonly type = '[PEB/Page] Arrange';

  constructor(
    public previousIndexId: string,
    public currentIndexId: string,
  ) {
  }
}

export class PebInsertPageAction {
  static readonly type = '[PEB/Page] Insert';

  constructor(
    public index: number,
    public page: PebPage,
  ) {
  }
}

export class PebResetPageAction {
  static readonly type = '[PEB/Page] Reset';
}
