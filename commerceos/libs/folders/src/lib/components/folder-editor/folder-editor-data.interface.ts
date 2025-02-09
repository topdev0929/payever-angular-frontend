import { PeGridItem } from '@pe/common';
import { PeFoldersActionsEnum, FolderItem } from '@pe/shared/folders';

export interface PeFolderEditorActionDataInterface {
  activeItem: FolderItem;
  actionType: PeFoldersActionsEnum;
}

export interface PeFolderEditorDataInterface {
  activeItem: FolderItem;
  actionType: PeFoldersActionsEnum;
  item: PeGridItem;
  nextPosition: number;
}

export interface PeFolderEditorDataToSaveInterface {
  actionType: PeFoldersActionsEnum;
  updatedFolder: FolderItem;
}
