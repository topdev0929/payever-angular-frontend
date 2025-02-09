import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {PebShopThemeEntity} from '@pe/builder-core';

import {AbstractInvoiceBuilderApi} from './abstract.builder.api';
import { PEB_INVOICE_BUILDER_API_PATH } from '../constants';
import { EnvService } from '@pe/common';


@Injectable()
export class PebActualInvoiceBuilderApi implements AbstractInvoiceBuilderApi {
  constructor(
    @Inject(PEB_INVOICE_BUILDER_API_PATH) private editorApiPath: string,
    private envService: EnvService,
    private http: HttpClient,
  ) {
  }

  private get businessId() {
    return this.envService.businessId;
  }

  getInvoicePreview(siteId: string, include?: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/business/${this.businessId}/application/${siteId}/preview`;
    return this.http.get<any>(endpoint, {params: {include: 'published', page: 'front'}});
  }

  getSiteActiveTheme(siteId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/business/${this.businessId}/application/${siteId}/themes/active`;
    return this.http.get<any>(endpoint);
  }

  getThemesList(siteId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/business/${this.businessId}/application/${siteId}/themes`;
    return this.http.get<any>(endpoint);
  }

  getTemplateList(): Observable<any> {
    return this.http.get(`${this.editorApiPath}/business/${this.envService.businessId}/application/${this.envService.businessId}/theme/template`);
  }

  getThemeById(themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/templates`);
  }

  duplicateTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.businessId}/invoice/${siteId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(siteId: string, themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/business/${this.businessId}/invoice/${siteId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.businessId}/invoice/${siteId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(siteId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/business/${this.businessId}/application/${siteId}/theme/${themeId}/install`,
      {},
    );
  }

  createTemplateTheme(themeId: string, body: any): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/${themeId}/template`,
      body,
    );
  }

  updateThemeVersion(themeId:string, versionId:string,body:any): Observable<any>{
    return this.http.patch(`${this.editorApiPath}/theme/${themeId}/version/${versionId}`, body)
  }


}
