import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { PebShopThemeEntity } from '@pe/builder-core';

export interface SubscriptionPreviewDTO {
  current: any;
  published: null | any;
}

@Injectable()
export abstract class AbstractSubscriptionBuilderApi {

  abstract getSitePreview(applicationId: string, include?: string): Observable<SubscriptionPreviewDTO>;

  abstract getSiteActiveTheme(applicationId: string): Observable<any>;

  abstract getThemesList(applicationId: string): Observable<any>;

  abstract getThemeById(applicationId: string, themeId: string): Observable<any>;

  abstract getTemplateThemes(): Observable<any>;

  abstract duplicateTemplateTheme(applicationId: string, themeId: string): Observable<PebShopThemeEntity>;

  abstract deleteTemplateTheme(applicationId: string, themeId: string): Observable<void>;

  abstract instantInstallTemplateTheme(applicationId: string, themeId: string): Observable<PebShopThemeEntity>;

  abstract installTemplateTheme(applicationId: string, themeId: string): Observable<PebShopThemeEntity>;
  abstract createTemplateTheme(themeId: string, body: any): Observable<any>;
  abstract updateThemeVersion(themeId: string, versionId: string, body: any): Observable<any>;

}
