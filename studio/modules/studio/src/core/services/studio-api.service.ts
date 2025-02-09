import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inject, Injectable } from '@angular/core';

import { EnvironmentConfigInterface } from '@pe/common';
import { PE_ENV } from '@pe/common';

import {
  PeCreateAlbumBody,
  PeCreateUserAttributeBody,
  PeCreateUserAttributeGroupBody,
  PeCreateUserAttributeGroupResponse,
  PeCreateUserMedia,

  PeStudioPageOptions,
} from '../interfaces/media-details.model';
import { PeStudioMedia } from '../interfaces/studio-media.interface';
import { PeAttribute } from '../interfaces/studio-attributes.interface';
import { PeStudioAlbum } from '../interfaces/studio-album.interface';



@Injectable({
  providedIn: 'root',
})
export class StudioApiService {
  private readonly apiPath: string;
  private readonly mediaPath;


  constructor(
    @Inject(PE_ENV) env: EnvironmentConfigInterface,
    private http: HttpClient
  ) {
    this.apiPath = (env.backend as any).studio;
    this.mediaPath = env.backend.media;
  }

  getAllMedia(businessId: string, options: PeStudioPageOptions = {}, folderId?: string): Observable<PeStudioMedia[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);
    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${businessId}/subscription${folderId ? '/folder/' + folderId : ''}`, {
      params,
    });
  }

  getSubscriptionMediaByAttribute(
    businessId: string,
    attributeId: string,
    attributeValue: string,
  ): Observable<PeStudioMedia[]> {
    return this.http.get<PeStudioMedia[]>(
      `${this.apiPath}/api/subscription/attribute/${attributeId}/${attributeValue}`,
    );
  }

  getOwnUserMedia(businessId: string, options: PeStudioPageOptions = {}): Observable<PeStudioMedia[]> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    /* params = params.append('page', options.page);
    params = params.append('limit', options.limit);*/
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }
    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${businessId}/media`, {
      params,
    });
  }

  searchUserMedia(businessId: string, name: string, options: PeStudioPageOptions = {}): Observable<PeStudioMedia[]> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    /* params = params.append('page', options.page);
     params = params.append('limit', options.limit);*/
    params = params.append('name', name);
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }
    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${businessId}/media/search`, {
      params,
    });
  }

  searchSubscriptions(
    businessId: string,
    name: string,
    options: PeStudioPageOptions = {},
  ): Observable<PeStudioMedia[]> {
    let params = new HttpParams();
    // todo: implement pagination with infinite scroll
    params = params.append('name', name);
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }
    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${businessId}/subscription/search`, {
      params,
    });
  }

  getStudioGridFilters(businessId: string, options: PeStudioPageOptions = {}): Observable<PeAttribute[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);
    return this.http.get<PeAttribute[]>(`${this.apiPath}/api/attribute?limit=20`, {
      params,
    });
  }

  getUserFilters(businessId: string, options: PeStudioPageOptions = {}): Observable<PeAttribute[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);
    return this.http.get<PeAttribute[]>(`${this.apiPath}/api/${businessId}/attribute?limit=20`, {
      params,
    });
  }

  getUserSubscriptionMediaById(businessId: string, mediaId: string): Observable<PeStudioMedia> {
    return this.http.get<any>(`${this.apiPath}/api/${businessId}/media/${mediaId}`, {});
  }

  getSubscriptionMediaById(businessId: string, mediaId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/api/${businessId}/subscription/${mediaId}`, {});
  }

  deleteMultipleUserMedia(businessId: string, mediaIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiPath}/api/${businessId}/medias/delete`, { ids: mediaIds });
  }

  deleteUserMedia(businessId: string, mediaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiPath}/api/${businessId}/media/${mediaId}`, {});
  }

  createUserMedia(businessId: string, body: PeCreateUserMedia): Observable<PeStudioMedia> {
    return this.http.post<PeStudioMedia>(`${this.apiPath}/api/${businessId}/media`, body, {});
  }

  sendMediaFile<T>(file: File, businessId: string, type: 'video' | 'image', container: string): Observable<HttpEvent<T>> {
    const formData = new FormData();
    formData.set('file', file);
    return this.http.post<any>(
      `${this.mediaPath}/api/${type}/business/${businessId}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  createAlbum(businessId, body: PeCreateAlbumBody): Observable<PeStudioAlbum> {
    return this.http.post<PeStudioAlbum>(`${this.apiPath}/api/${businessId}/album`, body, {});
  }

  updateAlbum(businessId, albumId: string, body: PeCreateAlbumBody): Observable<PeStudioAlbum> {
    return this.http.patch<PeStudioAlbum>(`${this.apiPath}/api/${businessId}/album/${albumId}`, body, {});
  }

  // todo: add type
  addMultipleMediaToAlbum(businessId, ids: string[], albumId: string): Observable<PeStudioMedia[]> {
    return this.http.post<any>(`${this.apiPath}/api/${businessId}/medias/add/album/${albumId}`, { ids });
  }

  deleteAlbum(businessId: string, albumId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiPath}/api/${businessId}/album/${albumId}`);
  }


  getUserAlbums(businessId: string, options: PeStudioPageOptions = {}): Observable<PeStudioAlbum[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);
    return this.http.get<PeStudioAlbum[]>(`${this.apiPath}/api/${businessId}/album?limit=100`, {});
  }

  getSubscriptionFolders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiPath}/api/folders/tree`);
  }

  getSubscriptionBaseFolders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiPath}/api/folders/base`);
  }

  getSubscriptionFoldersByParrent(parentId): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiPath}/api/folders/parent/${parentId}`);
  }

  getSubscriptionAlbums(businessId: string): Observable<PeStudioAlbum[]> {
    return this.http.get<any>(`${this.apiPath}/api/albums`);
  }

  getAlbumById(businessId: string, albumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiPath}/api/${businessId}/album/${albumId}`);
  }

  getAlbumsByAttribute(businessId: string, attribute: PeAttribute): Observable<any> {
    return this.http.get<PeStudioAlbum[]>(`${this.apiPath}/api/${businessId}/album/by-user-attribute/${attribute._id}/${attribute.name}?limit=20&page=1&asc=name&desc=updatedAt&asc=url`);
  }

  getAlbumMediaById(businessId: string, albumId: string): Observable<any> {
    return this.http.get(`${this.apiPath}/api/${businessId}/media/album/${albumId}`);
  }

  downloadMedia(mediaUrl): void {
    const mediaName = mediaUrl.split('/').pop();
    this.http.get(mediaUrl, { responseType: 'blob' }).subscribe(val => {
      const url = URL.createObjectURL(val);
      this.downloadUrl(url, mediaName);
      URL.revokeObjectURL(url);
    });
  }

  getUserAttributes(businessId): Observable<PeAttribute[]> {
    return this.http.get<PeAttribute[]>(`${this.apiPath}/api/${businessId}/attribute?limit=20&page=1&asc=name&desc=updatedAt&asc=url`);
  }

  getSubscriptionAttributes(): Observable<PeAttribute[]> {
    return this.http.get<PeAttribute[]>(`${this.apiPath}/api/attribute?limit=20&page=1&asc=name&desc=updatedAt&asc=url`);
  }

  createUserAttribute(businessId, body: PeCreateUserAttributeBody): Observable<PeAttribute> {
    return this.http.post<any>(`${this.apiPath}/api/${businessId}/attribute`, body, {});
  }

  createUserAttributeGroup(
    businessId,
    body: PeCreateUserAttributeGroupBody,
  ): Observable<PeCreateUserAttributeGroupResponse> {
    return this.http.post<any>(`${this.apiPath}/api/${businessId}/attribute/group`, body, {});
  }

  getUserAttributeGroups(
    businessId: string,
    options: PeStudioPageOptions = { page: '1', limit: '20' },
  ): Observable<PeCreateUserAttributeGroupResponse[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);
    return this.http.get<PeCreateUserAttributeGroupResponse[]>(`${this.apiPath}/api/${businessId}/attribute/group`, {});
  }

  getUserAttributeByGroup(
    businessId: string,
    groupId: string,
    options: PeStudioPageOptions = { page: '1', limit: '20' },
  ): Observable<PeCreateUserAttributeGroupResponse[]> {
    const params = new HttpParams();
    params.append('page', options.page);
    params.append('limit', options.limit);
    return this.http.get<PeCreateUserAttributeGroupResponse[]>(`${this.apiPath}/api/${businessId}/attribute/by-group/${groupId}`, {});
  }

  updateAttribute(businessId: string, payload: any, id: any): Observable<PeAttribute> {
    return this.http.patch<PeAttribute>(`${this.apiPath}/api/${businessId}/attribute/${id}`, payload, {});
  }

  deleteAttribute(businessId: string, selectedCategoryId: string): Observable<any> {
    return this.http.delete(`${this.apiPath}/api/${businessId}/attribute/${selectedCategoryId}`);
  }

  private downloadUrl(url: string, fileName: string): void {
    const a: any = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }

  updateMedia(businessId, payload, id): Observable<any> {
    return this.http.patch<any>(`${this.apiPath}/api/${businessId}/media/${id}`, payload, {});
  }

  getOwnRootItems(businessId: string, options: PeStudioPageOptions = {}): Observable<any> {
    let params = new HttpParams();
    if (options.sort) {
      params = params.append(options.sort.order, options.sort.param);
    }
    return this.http.get<PeStudioMedia[]>(`${this.apiPath}/api/${businessId}/media/noalbum`, {
      params,
    });
  }

  duplicateMedia(businessId, payload: { userMediaIds: string[], album?: string, prefix?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiPath}/api/${businessId}/media/duplicate`, payload);
  }
}
