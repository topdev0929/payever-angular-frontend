import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import {
  PebImageUploadResponse,
  PebPaginationParams,
  PebScript,
  PebShopThemeVersion,
  PebThemeDetail,
  PebThemeEntity,
} from '@pe/builder/core';
import { runMigrations } from '@pe/builder/migrations';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PEB_MEDIA_API_PATH, PEB_STORAGE_PATH } from './constants';


@Injectable({ providedIn: 'any' })
export class PebEditorApi {

  baseUrl: string;
  baseScriptUrl: string;
  baseAppUrl: string;

  constructor(
    @Inject(PEB_MEDIA_API_PATH) private apiMediaPath: string,
    @Inject(PEB_STORAGE_PATH) private mediaStoragePath: string,
    private http: HttpClient,
    private readonly env: PeAppEnv,
    @Optional() @Inject(PE_ENV) private peEnv: EnvironmentConfigInterface,
  ) {
    this.baseUrl = `${this.env.builder}/api/theme`;
    this.baseScriptUrl = `${this.env.builder}/api/script`;
    this.baseAppUrl = `${this.env.api}/api/business/${this.env.business}/application/${this.env.id}`;
  }

  getBusinessApps() {
    return this.http.get(`${this.env.builder}/api/business/${this.env.business}/list`);
  }

  getApp() {
    return this.http.get<any>(`${this.env.api}/api/business/${this.env.business}/${this.env.type}/${this.env.id}`);
  }

  getTheme(id: string, version: number = 0) {
    return this.http.get(`${this.baseUrl}/${id}/version/${version}`);
  }

  getPageList(theme: string, version: number = 0) {
    return this.http.get<any[]>(`${this.baseUrl}/${theme}/pages/version/${version}`);
  }

  getElements(theme: string, page: string, version: number) {
    const url = `${this.baseUrl}/${theme}/page/${page}/element/version/${version}`;

    return this.http.get<any[]>(url).pipe(
      concatMap(elements => runMigrations(this.env, { id: page, elements })),
      map(({ elements }) => elements),
    );
  }

  getPages(themeId: string, version: number = 0): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${themeId}/pages/version/${version}`);
  }

  getScripts(theme: string, version: number = 0): Observable<PebScript[]> {
    const url = `${this.baseScriptUrl}/theme/${theme}/all/version/${version}`;

    return this.http.get<any>(url);
  }

  getThemeDetail(theme: string, page?: string): Observable<PebThemeDetail> {
    return this.http.get<PebThemeDetail>(`${this.baseUrl}/${theme}/detail`, { params: page ? { page } : null });
  }

  getPage(theme: string, page: string,) {
    return this.http.get<any>(`${this.baseUrl}/${theme}/page/${page}`).pipe(
      mergeMap(async value => await runMigrations(this.peEnv, value)),
    );
  }

  getThemesList() {
    return this.http.get<any>(`${this.baseAppUrl}/themes`);
  }

  getThemeById(theme: string) {
    return this.http.get<any>(`${this.baseUrl}/${theme}`);
  }

  getActiveTheme(){
    const url = `${this.env.builder}/api/business/${this.env.business}/application/${this.env.id}/themes/active`;

    return this.http.get<any>(url).pipe(
      map((value) => {
        const { theme, ...rest } = value;

        return { versionNumber: null, ...rest, id: theme };
      })
    );
  }

  createTheme(input: any) {
    return this.http.post(this.baseUrl, input);
  }

  getThemeActiveVersion(theme: string): Observable<PebShopThemeVersion> {
    return this.http.get<any>(`${this.baseUrl}/${theme}/version/active`);
  }

  createThemeVersion(theme: string, name?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${theme}/version`, { name });
  }

  updateThemePreview(theme: string, imagePreview: string) {
    return this.http.put<any>(`${this.baseUrl}/${theme}/image-preview`, { imagePreview });
  }

  updateThemeName(theme: string, name: string) {
    return this.http.patch<any>(`${this.baseUrl}/${theme}/name`, { name });
  }

  publishThemeVersion(theme: string, versionId: string) {
    return this.http.put<any>(`${this.baseUrl}/${theme}/version/${versionId}/publish`, {}).pipe(
    );
  }

  updateVersion(theme: string, versionId: string, body: any) {
    return this.http.patch(`${this.baseUrl}/${theme}/version/${versionId}`, body);
  }

  getTemplateThemes(): Observable<PebThemeEntity[]> {
    return this.http.get<any>(`${this.env.builder}/api/templates`);
  }

  getTemplateItemThemes(itemId: string) {
    return this.http.get<any>(`${this.env.builder}/api/template/item/${itemId}`);
  }

  installTemplateTheme(theme: string, id?: string): Observable<PebThemeEntity> {
    const baseUrl = `${this.env.builder}/api/business/${id ?? this.env.business}/application`;

    return this.http.post<PebThemeEntity>(`${baseUrl}/${id}/theme/${theme}/install`, {});
  }

  // TODO(@mivnv): Move it to the media service
  uploadImage(container: string, file: File, returnShortPath: boolean): Observable<PebImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebImageUploadResponse>(
      `${this.apiMediaPath}/api/image/business/${this.env.business}/${container}`,
      formData,
    )
      .pipe(
        map((response: PebImageUploadResponse) => {
          return {
            ...response,
            blobName: `${returnShortPath ? '' : this.mediaStoragePath}/${container}/${response.blobName}`,
          };
        }),
        catchError((_) => {
          return of(null);
        }));
  }

  uploadImageWithProgress(
    container: string,
    file: File,
    returnShortPath = true
  ): Observable<HttpEvent<PebImageUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<PebImageUploadResponse>(
      `${this.apiMediaPath}/api/image/business/${this.env.business}/${container}`,
      formData,
      { reportProgress: true, observe: 'events' },
    ).pipe(
      map((event: HttpEvent<PebImageUploadResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number((event.loaded / event.total * 100).toFixed(0)),
            };
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${returnShortPath ? '' : this.mediaStoragePath}/${container}/${event.body.blobName}`,
              },
            };
          }
          default:
            return event;
        }
      }),
      catchError((_) => {
        return of(null);
      }));
  }

  getCurrentPreview(id: string, currentDetail: boolean, diff: boolean, page: string = null) {
    const endpoint = `${this.env.builder}/api/business/${this.env.business}/application/${id}/preview`;

    const params = Object.assign(
      {},
      currentDetail ? { currentDetail: JSON.stringify(currentDetail) } : null,
      diff ? { diff: JSON.stringify(diff) } : null,
      page ? { page } : null,
    );

    return this.http.get<any>(endpoint, { params });
  }

  getPageAlbumsFlatTree(id: string, theme: string) {
    return this.http.get<any>(`${this.env.builder}/api/application/${id}/theme/${theme}/page-album/flattree`);
  }

  getPageAlbumsTree(id: string, theme: string) {
    return this.http.get<any>(`${this.env.builder}/api/application/${id}/theme/${theme}/page-album/tree`);
  }

  createPageAlbum<T>(id: string, theme: string, album: any):Observable<T> {
    return this.http.post<T>(`${this.env.builder}/api/application/${id}/theme/${theme}/page-album`, album);
  }

  deletePageAlbum<T>(id: string, theme: string, pageAlbumId: string):Observable<T> {
    return this.http.delete<T>(`${this.env.builder}/api/application/${id}/theme/${theme}/page-album/${pageAlbumId}`);
  }

  updatePageAlbum<T>(id: string, theme: string, album: any):Observable<T> {
    return this.http.patch<T>(`${this.env.builder}/api/application/${id}/theme/${theme}/page-album/${album._id}`, album);
  }

  getPageByAlbum(id: string, theme: string, albumId: string, {
    offset = 1,
    limit = 10,
  }: PebPaginationParams = {}):
    Observable<any> {
    const params = {
      page: offset.toString(),
      limit: limit.toString(),
    };

    return this.http.get<any>(`${this.env.builder}/api/application/${id}/page/album/${albumId}`, { params });
  }
}
