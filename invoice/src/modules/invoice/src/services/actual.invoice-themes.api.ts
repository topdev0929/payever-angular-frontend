import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { pebCreateEmptyShop, PebPaginationParams, PebShop, PebShopThemeEntity, PebShopThemeId } from '@pe/builder-core';
import { PEB_INVOICE_BUILDER_API_PATH} from '../constants';
import { EnvService } from '@pe/common';
import { InvoiceEnvService } from './invoice-env.service';
import { map } from 'rxjs/operators';


@Injectable()
export class ActualPebInvoiceThemesApi {

  constructor(
    @Inject(PEB_INVOICE_BUILDER_API_PATH) private editorApiPath: string,
    @Inject(EnvService) private envService: InvoiceEnvService,
    private http: HttpClient,
  ) {
  }

   getThemesList(): Observable<any> {
    const { businessId } = this.envService;
    const endpoint = `${this.editorApiPath}/business/${businessId}/application/${this.envService.businessId}/themes`;

    return this.http.get(endpoint);
  }
  getTemplateList(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/template`);
  }

  getThemeById(themeId: PebShopThemeId): Observable<any> {
    return this.http.get(`${this.editorApiPath}/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<PebShopThemeEntity> {
    return this.http.get<any>(`${this.editorApiPath}/templates`);
  }

  duplicateTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  getThemesByTemplateId(){
    return this.http.get<any>(`${this.editorApiPath}/templates`);
  }

  getTemplateItemThemes(ids: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    const [id] = ids;
    return this.http.get<any>(`${this.editorApiPath}/template/item/${id}`, {
      params: { offset: offset.toString(), limit: limit.toString() },
    })
    .pipe(
      map((data) => data.themes)
    );
  }

  deleteTemplateTheme(themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.post<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/${themeId}/install`,
      {},
    );
  }

  switchTemplateTheme(themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/${themeId}/switch`,
      {},
    );
  }


  createThemeAlbum(album: any): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album`,
      album,
    );
  }

  updateThemeAlbum(albumId: string, album: any): Observable<any> {
    return this.http.patch<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album/${albumId}`,
      album,
    );
  }

  getThemeBaseAlbum(): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album`,
    );
  }

  getThemeAlbumById(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album/${albumId}`,
    );
  }

  getThemeAlbumByParrent(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album/parent/${albumId}`,
    );
  }

  getThemeAlbumByAncestor(albumId: string): Observable<any> {
    return this.http.get<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album/ancestor/${albumId}`,
    );
  }

  deleteThemeAlbum(albumId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album/${albumId}`,
    );
  }

  getThemeByAlbum(albumId?: string, pagination?: PebPaginationParams): Observable<any> {
    const { offset = 0, limit = 100 } = pagination;
    const params: { [key: string]: string } = { offset: offset.toString(), limit: limit.toString() };
    if (albumId) {
      params.albumId = albumId;
    }
    return this.http.get<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/album`,
      { params },
    );
  }


  linkThemeToAlbum(themeId: string, albumId?: string): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/${themeId}/album/${albumId}`,
      {},
    );
  }

  unlinkTheme(themeId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/${themeId}/album`,
    );
  }

  createApplicationTheme(name: string): Observable<any> {
    const content = pebCreateEmptyShop();
    return this.http.post<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme`,
      { content, name },
    );
  }
  duplicateThemeAlbum(payload: { albumIds: string[], parent?: string, prefix?: string }): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album/duplicate`,
      payload,
    );
  };
  getThemeAlbumByParent(albumId:string):Observable<any>{
    return this.http.get<any>(
      `${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme-album/parent/${albumId}`,
    )
  }
}
