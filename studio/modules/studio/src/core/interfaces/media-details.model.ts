
export interface MediaDetails {
    media: any;
    mediaView: MediaViewEnum;
    businessId: string;
}
export enum MediaViewEnum {
  allMedia = 'all',
  ownMedia = 'own',
}

export interface BlobCreateResponse {
  blobName: string;
  brightnessGradation?: string;
}

export enum AlbumsViewEnum {
  allAlbums = 'all',
  ownAlbums = 'own',
}

export interface PeStudioPageOptions {
  page?: string;
  limit?: string;
  sort?: {
    order: 'asc' | 'desc';
    param: string;
  };
}

export interface PeCreateUserMedia {
  url: string;
  businessId: string;
  mediaType?: 'image' | 'video';
  name?: string;
}


export interface PeCreateAlbumBody {
  albumId?: string;
  businessId: string;
  description?: string;
  icon?: string;
  name: string;
  parent?: string;
  userAttributes?: any[];
}

export interface PeCreateAlbumResponse {
  ancestors: any[];
  business: string;
  name: string;
  icon: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
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
