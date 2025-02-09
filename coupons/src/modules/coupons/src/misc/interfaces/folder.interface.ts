import { PeCouponMoveToFolderToEnum } from './folder.enum';


export interface PeFolderType {
  moveToFolder?: PeCouponMoveToFolderToEnum;
  getFolders?: string[] | PeFolder[];
}

export class PeFolder {
  _id?: string;
  name?: string;
  image?: string;
  parentFolder?:string;
  id?: string;
  children?: PeFolder[];

  constructor() {
    this.id = this._id;
  }

}
