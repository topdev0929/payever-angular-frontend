import { InjectionToken } from '@angular/core';

import { PebPage } from '@pe/builder/core';

export enum PebWebsocketEventType {
  /** get shapes */
  GetShape = 'get.shape',
  GetShapeWithFilter = 'get.shape.filter',
  GetShapeById = 'get.shape.by.id',
  /** edit shapes */
  CreateShape = 'create.shape',
  UpdateShape = 'update.shape',
  DeleteShape = 'delete.shape',
  /** shape albums */
  GetShapeAlbum = 'get.shape.album',
  GetShapeAlbumById = 'get.shape.album.by.id',
  CreateShapeAlbum = 'create.shape.album',
  UpdateShapeAlbum = 'update.shape.album',
  DeleteShapeAlbum = 'delete.shape.album',

  Publish = 'publish',
  CreatePage = 'create.pages',
  DuplicatePage = 'clone.page',
  JsonPatch = 'json.patch',
  LoadUndoList = 'list.json.patch.history',
}

export enum PebErrorMessage{
  tokenInvalid = 'Token Invalid',
}

export class PebWebsocketData<T = any> {
  themeId?: string;
  pageId?: string;
  pages?: Partial<PebPage>[];
  versionNumber?: number;
  elements?: T[];
  patches?: any;
  inversePatches?: any;
}

export interface PebShapesData {
  pagination?: { offset: number; limit: number; },
  filters?: Array<{ field: string; condition: string; value: string; }>;
  applicationId?: string;
}

export interface PebElementMessage<T> {
  event: PebWebsocketEventType;
  data: ({ token: string; } | { access: string; }) & 
    { id: string; businessId?: string; params: PebWebsocketData<T> | PebShapesData; }
}

export interface PebCreatePageMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.CreatePage;
}

export interface PebDuplicatePageMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.DuplicatePage;
}

export interface PebCreateShapeAlbumMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.CreateShapeAlbum;
}

export interface PebUpdateShapeAlbumMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.UpdateShapeAlbum;
}

export interface PebDeleteShapeAlbumMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.DeleteShapeAlbum;
}

export interface PebCreateShapeMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.CreateShape;
}

export interface PebUpdateShapeMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.UpdateShape;
}

export interface PebDeleteShapeMessage extends PebElementMessage<any> {
  event: PebWebsocketEventType.DeleteShape;
}

export interface PebShapeAlbumsListMessage extends PebElementMessage<PebShapesData> {
  event: PebWebsocketEventType.GetShapeAlbum;
}

export interface PebShapesListMessage extends PebElementMessage<PebShapesData> {
  event: PebWebsocketEventType.GetShapeWithFilter;
}

export type PebWebsocketMessage =
  | PebCreatePageMessage
  | PebDuplicatePageMessage
  | PebShapesListMessage
  | PebShapeAlbumsListMessage
  | PebCreateShapeAlbumMessage
  | PebUpdateShapeAlbumMessage
  | PebDeleteShapeAlbumMessage
  | PebCreateShapeMessage
  | PebUpdateShapeMessage
  | PebDeleteShapeMessage;

export interface PebWebsocketResponseMessage {
  id: string;
  name: PebWebsocketEventType;
  result: boolean;
  data?: any;
  error?: string;
}

export const PEB_EDITOR_WS_PATH = new InjectionToken<string>('PEB_EDITOR_WS_PATH');
