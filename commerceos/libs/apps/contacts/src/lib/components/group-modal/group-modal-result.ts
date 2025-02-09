import { FolderItem } from '@pe/shared/folders';

export interface GroupModalResult{
    isCancel:boolean,
    isOk:boolean
    moveToFolder:FolderItem,
    addedFolders:any[],
}
