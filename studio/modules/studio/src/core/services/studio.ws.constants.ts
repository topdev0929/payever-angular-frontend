export enum PebStudioWsEvents {
    GetStudioAlbums = 'list.albums',
    CreateStudioAlbum = 'create.album',
    UpdateStudioAlbum = 'update.album',
    GetStudioAlbumById = 'get.album',
    GetStudioAlbumByParent = 'get.albums.by.parent',
    GetStudioAlbumByAncestor = 'get.albums.by.ancestor',
    GetStudioAlbumByAttribute = 'get.albums.by.attribute',
    GetStudioAlbumByMultipleAttributes = 'get.albums.by.multiple.attributes',
    DeleteStudioAlbum = 'delete.album',
  }

export interface PebStudioWsRequestMessage {
    event: string;
    data: {
      token: string,
      params?: any,
      id?: string,
    };
  }

export interface PebStudioWsResponseMessage {
    id: string;
    name: string;
    result: boolean;
    data?: any;
  }
