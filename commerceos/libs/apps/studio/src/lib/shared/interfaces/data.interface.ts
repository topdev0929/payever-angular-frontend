import { TreeFilterNode } from "@pe/common";

export interface PeStudioCategory {
  editing: boolean;
  listItems: any[];
  active: boolean;
  subCategory: PeStudioCategory[];
  _id: string;
  business: any;
  name: string;
  iconUrl: string;
  tree: TreeFilterNode[];
}


export interface PeStudioMedia {
  album: string;
  albumName: string;
  _id: string;
  business: any;
  url: string;
  category: PeStudioCategory;
  createdAt: string;
  mediaType: string;
  name: string;
  updatedAt: string;
  description: string;
}


export enum MediaType {
  Image = 'image',
  Video = 'video',
  Text = 'text',
  File = 'file',
  Script = 'script',
}

export interface PeCreateUserAttributeGroupBody {
  businessId: string;
  name: string;
}

export interface PeCreateUserAttributeGroupResponse {
  _id: string;
  business: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PeCreateUserAttributeBody {
  businessId: string;
  icon?: string;
  name: string;
  type: string;
  filterAble: boolean;
  onlyAdmin: boolean;
  showOn?: string;
  defaultValue?: string;
  userAttributeGroupId?: string;
}

export interface PeCreateUserAttributeResponse {
  businessId: string;
  icon: string;
  name: string;
  type: string;
  filterAble: boolean;
  onlyAdmin: boolean;
  showOn: string;
  defaultValue: string;
  userAttributeGroupId: string;
}
