import { PeDataGridItem } from '@pe/common';

export class InitLoadFolders {
  static readonly type = '[StudioMedia/API] Init Load Folders';
  constructor(public data: any, public group: boolean) { }
}

export class AddItems {
  static readonly type = '[StudioMedia/API] Add Items';
  constructor(public items: any[]) { }
}

export class AddStudioMedia {
  static readonly type = '[StudioMedia/API] Add StudioMedia';
  constructor(public items: any) {}
}

export class ClearStudioMedia {
  static readonly type = '[StudioMedia/API] Clear StudioMedia';
}

export class PopupMode {
  static readonly type = '[StudioMedia/API] Popup Mode';
  constructor(public trigger: boolean) {}
}

export class OpenFolder {
  static readonly type = '[StudioMedia/API] open Folder';
  constructor(public items: PeDataGridItem[]) { }
}

export class DeleteItems {
  static readonly type = '[StudioMedia/API] Delete Items';
  constructor(public items: string[]) { }
}

export class AddItem {
  static readonly type = '[StudioMedia/API] Add Item';
  constructor(public item: any) { }
}

export class AddFolder {
  static readonly type = '[StudioMedia/API] Add Folder';
  constructor(public item: any) { }
}

export class EditItem {
  static readonly type = '[StudioMedia/API] Edit Item';
  constructor(public item: any) { }
}

export class ClearStore {
  static readonly type = '[StudioMedia/API] Clear Store';
}
export class GroupStore {
  static readonly type = '[StudioMedia/API] Grouping Store';
  constructor(public order: string = '', public group: boolean = false) { }
}

export class SortStore {
  static readonly type = '[StudioMedia/API] Sorting Store';
  constructor(public group: boolean = false) { }
}
