import { PeGridItemType } from '@pe/common';
import { FolderItem, RootFolderItem } from '@pe/shared/folders';



export interface MoveIntoFolderEvent {
  folder: FolderItem;
  moveItems: PeMoveToFolderItem[];
}

export interface MoveIntoRootFolderEvent {
  folder: RootFolderItem;
  moveItems: PeMoveToFolderItem[];
}

export interface PeMoveToFolderItem {
  id: string;
  type: PeGridItemType,
  [key:string]: any;
}
