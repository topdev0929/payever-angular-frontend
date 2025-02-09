import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { PebThemesApi } from '@pe/builder-api';
import {pebCreateEmptyShop, PebPaginationParams, PebShop, PebShopThemeEntity, PebShopThemeId } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { PEB_SITE_API_BUILDER_PATH } from '../../constants';
import { SiteEnvService } from '../site-env.service';

@Injectable()
export class ActualPebSitesThemesApi extends PebThemesApi {

  constructor(
    @Inject(PEB_SITE_API_BUILDER_PATH) private editorApiPath: string,
    @Inject(EnvService) private envService: SiteEnvService,
    private http: HttpClient,
  ) {
    super();
  }

   getThemesList(): Observable<any> {
    const { businessId, siteId } = this.envService;
    const endpoint = `${this.editorApiPath}/api/business/${businessId}/application/${siteId}/themes`;

    return this.http.get(endpoint);
  }

  getThemeById(themeId: PebShopThemeId): Observable<any> {
    return this.http.get(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getTemplateThemes({ offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<PebShopThemeEntity> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`, {
      params: { offset: offset.toString(), limit: limit.toString() },
    });
  }

  getTemplateItemThemes(ids: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/template/themes`, { ids }, {
      params: { offset: offset.toString(), limit: limit.toString() },
    });
  }

  getThemesByTemplateId(itemId: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.http.post<any>(`${this.editorApiPath}/api/template/items`, { ids: itemId });
  }

  duplicateTemplateTheme(themeId: string,albumId?:string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme/${themeId}/duplicate`,
      albumId?{albumId}:{},
    );
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme/${themeId}/install`,
      {},
    );
  }

  switchTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme/${themeId}/switch`,
      {},
    );
  }


  createThemeAlbum(album: any): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album`,
      album,
    );
  }

  updateThemeAlbum(albumId: string, album: any): Observable<any> {
    return this.http.patch<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album/${albumId}`,
      album,
    );
  }

  getThemeBaseAlbum(): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album`,
    );
  }

  getThemeAlbumById(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album/${albumId}`,
    );
  }

  getThemeAlbumByParent(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album/parent/${albumId}`,
    );
  }

  getThemeAlbumByParrent(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album/parent/${albumId}`,
    );
  }

  getThemeAlbumByAncestor(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album/ancestor/${albumId}`,
    );
  }

  deleteThemeAlbum(albumId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album/${albumId}`,
    );
  }

  getThemeByAlbum(albumId?: string, pagination?: PebPaginationParams): Observable<any> {
    const { offset = 0, limit = 100 } = pagination;
    const params: { [key: string]: string } = { offset: offset.toString(), limit: limit.toString() };
    if (albumId) {
      params.albumId = albumId;
    }
    return this.http.get<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme/album`,
      { params },
    );
  }

  linkThemeToAlbum(themeId: string, albumId?: string): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme/${themeId}/album/${albumId}`,
      {},
    );
  }

  unlinkTheme(themeId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme/${themeId}/album`,
    );
  }

  createApplicationTheme(name: string): Observable<any> {
    const content = pebCreateEmptyShop();
    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme`,
      { content, name },
    );
  }

  duplicateThemeAlbum(payload: { albumIds: string[], parent?: string, prefix: string }): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/business/${this.envService.businessId}/application/${this.envService.siteId}/theme-album/duplicate`,
      payload,
    );
  };
}
