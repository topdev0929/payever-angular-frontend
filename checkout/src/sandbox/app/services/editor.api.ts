import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';

import {
  CreateShopThemeDto,
  CreateShopThemePayload,
  PebEditorApi,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH, PEB_STORAGE_PATH,
  ShopPreviewDTO,
} from '@pe/builder-api';
// @ts-ignore
import {
  PebAction,
  PebEnvService,
  PebPageId,
  PebShopGeneratedThemeResponse,
  PebShopId, PebShopImageResponse,
  PebShopTheme,
  PebShopThemeEntity,
  PebShopThemeId,
  PebShopThemeSnapshot,
  PebShopThemeSourceId,
  PebShopThemeSourcePagePreviews,
  PebShopThemeVersion,
  PebShopThemeVersionEntity,
  PebShopThemeVersionId,
} from '@pe/builder-core';

export const PEB_SITE_HOST = new InjectionToken<string>('PEB_SITE_HOST');
export const PEB_SITE_API_PATH = new InjectionToken<string>('SITE_API_PATH');
export const PEB_SITE_API_BUILDER_PATH = new InjectionToken<string>('SITE_API_BUILDER_PATH');


@Injectable()
export class ActualPebEditorApi extends PebEditorApi {
  constructor(
    @Inject(PEB_SITE_API_BUILDER_PATH) private editorApiPath: string,
    @Inject(PEB_MEDIA_API_PATH) private apiMediaPath: string,
    @Inject(PEB_STORAGE_PATH) private mediaStoragePath: string,
    @Inject(PEB_GENERATOR_API_PATH) private apiGeneratorPath: string,
    private http: HttpClient,
    private envService: PebEnvService,
  ) {
    super();
  }

  activateShopThemeVersion(themeId: PebShopId, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/restore`, null);
  }

  addAction(shopId: any, action: PebAction): any {
    return this.http.post(`${this.editorApiPath}/api/theme/${shopId}/action`, action);
  }

  createShop(payload: any): Observable<any> {
    return undefined;
  }

  createShopTheme(input: CreateShopThemePayload): Observable<CreateShopThemeDto> {
    return this.http.post(`${this.editorApiPath}/api/theme`, input);
  }

  createShopThemeVersion(themeId: any, name: string): Observable<PebShopThemeVersionEntity> {
    return this.http.post<any>(`${this.editorApiPath}/api/theme/${themeId}/version`, {name});
  }

  deleteShop(shopId: string): Observable<null> {
    console.log('deleteShop is undefined');
    return undefined;
  }

  deleteShopThemeVersion(themeId: any, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}`, {});
  }

  duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/duplicate`, {});
  }

  generateTemplateTheme(
    category: string,
    page: string,
    theme: string,
    logo?: string,
  ): Observable<PebShopGeneratedThemeResponse> {
    const payload = {
      category,
      page,
      theme,
      logo,
    };
    return this.http.post<PebShopGeneratedThemeResponse>(
      `${this.apiGeneratorPath}/api/builder-generator/business/${this.envService.businessId}/generate`,
      payload,
    );
  }

  getActions(themeId: PebShopThemeId, limit?: number, offset?: number): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(
      `${this.editorApiPath}/api/theme/${themeId}/actions`,
      {params: limit ? {limit: `${limit}`, offset: `${offset}`} : {}},
    );
  }

  getAllAvailableThemes(): Observable<PebShopTheme[]> {
    const endpoint = `${this.editorApiPath}/api/themes`;

    return this.http.get<any[]>(endpoint);
  }

  getPageActions(themeId: PebShopThemeId, pageId: PebPageId): Observable<PebAction[]> {
    return this.http.get<PebAction[]>(`${this.editorApiPath}/api/theme/${themeId}/pages/${pageId}/actions`);
  }

  getShop(shopId: any): Observable<any> {
    console.log('get shop is undefined');
    return undefined;
  }

  getPage(themeId: string, pageId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/page/${pageId}`);

  }

  getPages(themeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.editorApiPath}/api/theme/${themeId}/pages`);
  }

  getShopActiveTheme(shopId: string): Observable<{
    id: string;
    theme: string;
    isActive: boolean;
    isDeployed: boolean;
  }> {
    const {businessId} = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${shopId}/themes/active`;

    return this.http.get<any>(endpoint);
  }

  getShopPreview(shopId: string, include?: string[]): Observable<ShopPreviewDTO> {
    const endpoint = `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${shopId}/preview`;

    return this.http.get<any>(endpoint, {params: {include: 'published', page: 'front'}});
  }

  getShopThemeActiveVersion(themeId: string): Observable<PebShopThemeVersion> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/active`);
  }

  getShopThemeById(themeId: PebShopThemeId): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getShopThemeVersionById(themeId: string, versionId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`);
  }

  getShopThemeVersions(themeId: any): Observable<PebShopThemeVersionEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/versions`);
  }

  getShopThemesList(): Observable<any> {
    const {businessId, shopId} = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${shopId}/themes`;

    return this.http.get(endpoint);
  }

  getShops(isDefault?: boolean): Observable<any[]> {
    console.log('get shops is undefined');
    return undefined;
  }

  getSnapshot(themeId: PebShopThemeId): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/snapshot`);
  }

  getSnapshotByVersionId(themeId: PebShopThemeId, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}/snapshot`);
  }

  getTemplateThemes(): Observable<PebShopThemeEntity[]> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/theme/${themeId}/install`, {});
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(`${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.shopId}/template/${themeId}/instant-setup`, {});
  }

// @toDO change after in builder editor implemented method for new api to publish theme
  publishShopThemeVersion(themeId: any, versionId: PebShopThemeVersionId): Observable<any> {
    return this.http.post(`${this.editorApiPath}/api/theme/${themeId}/publish`, {});
  }

  setAsDefaultShop(shopId: string): Observable<any> {
    return undefined;
  }

  undoAction(themeId: any, actionId: string): any {
    return this.http.delete(`${this.editorApiPath}/api/theme/${themeId}/action/${actionId}`);
  }

  updateReplicas(themeId: string, actions: PebAction[]): Observable<any> {
    return this.http.put<any>(
      `${this.editorApiPath}/api/theme/${themeId}/actions/apply`,
      actions,
    );
  }

  updateShop(payload: any): Observable<any> {
    return undefined;
  }

  updateShopDeploy(shopId: string, payload: any): Observable<any> {
    return undefined;
  }

  updateShopThemeName(themeId: any, name: string): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/name`, {name});
  }

  updateShopThemePreview(themeId: any, imagePreview: string): Observable<void> {
    return this.http.put<any>(`${this.editorApiPath}/api/theme/${themeId}/image-preview`, {imagePreview});
  }

  updateThemeSourcePagePreviews(
    themeId: PebShopThemeId,
    sourceId: PebShopThemeSourceId,
    previews: PebShopThemeSourcePagePreviews,
  ): Observable<any> {
    return this.http.patch<any>(`${this.editorApiPath}/api/theme/${themeId}/source/${sourceId}/previews`, previews);
  }

  uploadImage(container: string, file: File, returnShortPath?: boolean): Observable<PebShopImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: PebShopImageResponse) => {
          return {
            ...response,
            blobName: `${returnShortPath ? '' : this.mediaStoragePath}/${container}/${response.blobName}`,
          };
        }),
        catchError((_) => {
          // console.error('Behavior threw error: ', err);
          return of(null);
        }));
  }

  uploadImageWithProgress(container: string, file: File, returnShortPath?: boolean): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/image/business/${this.envService.businessId}/${container}`,
      formData,
      {reportProgress: true, observe: 'events'},
    ).pipe(
      map((event: HttpEvent<PebShopImageResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number(((event.loaded / event.total) * 100).toFixed(0)),
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
        // console.error('Behavior threw error: ', err);
        return of(null);
      }));
  }

  uploadVideo(container: string, file: File): Observable<PebShopImageResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
    )
      .pipe(
        map((response: PebShopImageResponse) => {
          return {
            ...response,
            blobName: `${this.mediaStoragePath}/${container}/${response.blobName}`,
            preview: `${this.mediaStoragePath}/${container}/${response.preview}`,
          };
        }),
        catchError((_) => {
          // console.error('Behavior threw error: ', err);
          return of(null);
        }));
  }

  uploadVideoWithProgress(container: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PebShopImageResponse>(
      `${this.apiMediaPath}/api/video/business/${this.envService.businessId}/${container}`,
      formData,
      {reportProgress: true, observe: 'events'},
    ).pipe(
      map((event: HttpEvent<PebShopImageResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress: {
            return {
              ...event,
              loaded: Number(((event.loaded / event.total) * 100).toFixed(0)),
            };
          }
          case HttpEventType.Response: {
            return {
              ...event,
              body: {
                ...event.body,
                blobName: `${this.mediaStoragePath}/${container}/${event.body.blobName}`,
                preview: `${this.mediaStoragePath}/${container}/${event.body.preview}`,
              },
            };
          }
          default:
            return event;
        }
      }),
      catchError((_) => {
        // console.error('Behavior threw error: ', err);
        return of(null);
      }));
  }
}
