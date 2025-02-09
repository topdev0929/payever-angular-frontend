import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PebShopThemeEntity } from '@pe/builder-core';
import { EnvService } from '@pe/common';

import { AbstractSubscriptionBuilderApi, SubscriptionPreviewDTO } from './abstract-subscriptionsbuilder.api';
import { PEB_SUBSCRIPTION_API_BUILDER_PATH } from '../../constants';
import { SubscriptionEnvService } from '../subscription/subscription-env.service';


@Injectable()
export class PebActualSubscriptionBuilderApi implements AbstractSubscriptionBuilderApi {
  constructor(
    @Inject(EnvService) private envService: SubscriptionEnvService,
    @Inject(PEB_SUBSCRIPTION_API_BUILDER_PATH) private editorApiPath: string,
    private http: HttpClient,
  ) {
  }


  private get businessId() {
    return this.envService.businessId;
  }

  getSitePreview(applicationId: string, include?: string): Observable<SubscriptionPreviewDTO> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${applicationId}/preview`;
    return this.http.get<SubscriptionPreviewDTO>(endpoint, { params: { include: 'published', page: 'front' } });
  }

  getSiteActiveTheme(applicationId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${applicationId}/themes/active`;
    return this.http.get<any>(endpoint);
  }

  getThemesList(applicationId: string): Observable<any> {
    const endpoint = `${this.editorApiPath}/api/business/${this.businessId}/application/${applicationId}/themes`;
    return this.http.get<any>(endpoint);
  }

  getThemeById(themeId: string): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/theme/${themeId}`);
  }

  getTemplateThemes(): Observable<any> {
    return this.http.get<any>(`${this.editorApiPath}/api/templates`);
  }

  duplicateTemplateTheme(applicationId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.businessId}/site/${applicationId}/theme/${themeId}/duplicate`,
      {},
    );
  }

  deleteTemplateTheme(applicationId: string, themeId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.editorApiPath}/api/business/${this.businessId}/site/${applicationId}/theme/${themeId}`,
      {},
    );
  }

  instantInstallTemplateTheme(applicationId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.businessId}/site/${applicationId}/template/${themeId}/instant-setup`,
      {},
    );
  }

  installTemplateTheme(applicationId: string, themeId: string): Observable<PebShopThemeEntity> {
    return this.http.put<PebShopThemeEntity>(
      `${this.editorApiPath}/api/business/${this.businessId}/application/${applicationId}/theme/${themeId}/install`,
      {},
    );
  }

  createTemplateTheme(themeId: string, body: any): Observable<any> {
    return this.http.post<any>(
      `${this.editorApiPath}/api/${themeId}/template`,
      body,
    );
  }

  updateThemeVersion(themeId: string, versionId: string, body: any): Observable<any>{
    return this.http.patch(`${this.editorApiPath}/api/theme/${themeId}/version/${versionId}`, body);
  }


}
