import { PebShape, PebShapeAlbum } from '@pe/builder/core';

export class PebInitShapesAction {
  static readonly type = '[PEB/Shape] Init';
}

export class PebResetShapesAction {
  static readonly type = '[PEB/Shape] Reset';
}

export class PebSetShapesAction {
  static readonly type = '[PEB/Shape] Set';

  constructor(public payload: PebShape[]) {
  }
}

export class PebSetShapeAlbumsAction {
  static readonly type = '[PEB/Shape] Set Albums';

  constructor(public payload: PebShapeAlbum[]) {
  }
}

export class PebCreateShapeAlbumAction {
  static readonly type = '[PEB/Shape] Create Shape Album';

  constructor(public payload: PebShapeAlbum) {
  }
}

export class PebUpdateShapeAlbumAction {
  static readonly type = '[PEB/Shape] Update Shape Album';

  constructor(public payload: PebShapeAlbum) {
  }
}

export class PebDeleteShapeAlbumAction {
  static readonly type = '[PEB/Shape] Delete Shape Album';

  constructor(public id: string) {
  }
}

export class PebCreateShapeAction {
  static readonly type = '[PEB/Shape] Create Shape';

  constructor(public payload: PebShape) {
  }
}

export class PebUpdateShapeAction {
  static readonly type = '[PEB/Shape] Update Shape';

  constructor(public payload: PebShape) {
  }
}

export class PebDeleteShapeAction {
  static readonly type = '[PEB/Shape] Delete Shape';

  constructor(public id: string) {
  }
}

export class PebSelectShapeAlbumAction {
  static readonly type = '[PEB/Shape] Select Shape Album';

  constructor(public id: string) {
  }
}