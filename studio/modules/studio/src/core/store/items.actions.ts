

export class UpdateGridItems {
  static readonly type = '[Attributes/API] Update GridItems';
  constructor(public items: any[]) {}
}

export class EditGridItem {
  static readonly type = '[Attributes/API] Edit GridItem';
  constructor(public newItem: any) {}
}
export class ClearStudio {
  static readonly type = '[Studio/API] clear Studio';
  constructor() {}
}
