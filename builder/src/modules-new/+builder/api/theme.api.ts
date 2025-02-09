import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isNil, omit } from 'lodash-es';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  PebAbstractThemeApi,
  PebAction,
  PebActionId,
  PebActionsHash,
  PebAppType,
  PebDocumentInitActionName,
  PebElement,
  PebElementAppendAction,
  PebElementType,
  PebElementUpdateAction,
  PebInstallTemplateDto,
  PebPage,
  PebPageCreateDto,
  PebPageEditDto,
  PebPageId,
  PebPagesCopyMultipleDto,
  PebPageStatus,
  PebTemplateGetCollectionDto,
  PebTheme,
  PebThemeCreateDto,
  PebThemeGetCollectionDto,
  PebThemeId,
  PebThemeUpdateDto,
  PebVersion,
  PebVersionCreateDto,
  PebVersionId,
  PebVersionShort,
} from '@pe/builder-core';
import { PeFeatureFlag } from '@pe/feature-flag';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { LIGHT_FEATURES, PREMIUM_FEAUTRES } from '../feature-flags';
import { SnackbarService } from '../services/snackbar.service';
import { ThemeContextStore } from '../utils/context.store';

const toClientTheme = ({ _id, __v, brief, ...themeProps }): PebTheme => ({
  id: _id,
  brief: brief.map(({ _id: bid, master, ...rest }) => ({ id: bid, masterId: master, ...rest })),
  ...themeProps,
}) as PebTheme;

const toClientAction = ({ _id: aid, ...actionRest }): PebAction => ({
  id: aid, ...actionRest,
}) as PebAction;

const toClientPage = ({ _id, __v, actions, snapshot, master, theme, ...rest }): PebPage => ({
  id: _id,
  themeId: theme,
  masterId: master,
  ...(actions ? { actions: actions.map(toClientAction) } : {}),
  ...(snapshot ? { snapshot: { id: snapshot._id, ...omit(snapshot, '_id') } } : {}),
  ...rest,
}) as PebPage;

const toClientVersion = ({ _id, __v, createdAt, updatedAt, ...versionProps }): PebVersionShort => ({
  id: _id,
  // pages: pages ? pages.map(toClientPage) : null,
  createdAt: new Date(createdAt),
  updatedAt: new Date(updatedAt),
  ...versionProps,
}) as unknown as PebVersionShort;

const toServerPage = ({ id, masterId, themeId, snapshot: { id: snapId, ...snapRest}, ...page }) => ({
  ...(id ? { _id: id } : {}),
  theme: themeId,
  master: masterId,
  snapshot: { _id: snapId, ...snapRest },
  ...page,
});

const toServerAction = ({ id, ...action }) => ({ _id: id, ...action });

// FIXME(#backend): On smallest update of theme or theme's pages current version should be reset

@Injectable({ providedIn: 'root'})
export class BuilderThemeApi implements PebAbstractThemeApi {
  constructor(
    private readonly config: EnvironmentConfigService,
    private readonly httpClient: HttpClient,
    private readonly contextStore: ThemeContextStore,
    private readonly snackbarService: SnackbarService,
    private readonly translateService: TranslateService,
  ) {}

  get builderApi(): string {
    return `${this.config.getConfig().backend.builder}/api`;
  }

  get businessId(): string {
    return this.contextStore.context.businessId;
  }

  get applicationId(): string {
    return this.contextStore.context.applicationId;
  }

  getFeatureFlags(): Observable<PeFeatureFlag[]> {
    // NOTE: this is temp code for testing. Further the feature flags will be recieved from backend
    const tempPlan: string = localStorage.getItem('pe-subscription-plan');
    const features: PeFeatureFlag[] = tempPlan === 'light' ? LIGHT_FEATURES : PREMIUM_FEAUTRES;

    return of(features);
  }

  createTheme(dto: PebThemeCreateDto): Observable<PebTheme> {
    const url = `${this.builderApi}/themes`;

    return this.httpClient.post(url, dto).pipe(
      map(toClientTheme),
      catchError( err => {
        return this.errorHandler(err);
      }),
    );
  }

  getApplicationThemes(
    businessId: string,
    applicationId: string,
    page = 1, // tslint:disable-line
    params?: PebThemeGetCollectionDto,
  ): Observable<PebTheme[]> {
    const url = `${this.builderApi}/themes/${businessId}/${applicationId}?page=${page}`;

    return this.httpClient.get(url, {
      params: params as any,
    }).pipe(
      map((themes: any[]) => themes.map(toClientTheme)),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  getBusinessThemes(businessId: string): Observable<PebTheme[]> {
    return undefined;
  }

  getTemplates(dto: any): Observable<PebTheme[]> {
    dto.page = isNil(dto.page) ? 1 : dto.page;
    if (!isNil(dto.id)) {
      dto['_id'] = dto.id;
      delete dto.id;
    }

    const url = `${this.builderApi}/themes`;

    return this.httpClient.get(url, {
      params: dto as any,
    }).pipe(
      map((themes: any[]) => themes.map(toClientTheme)),
      map(themes => themes.filter(t => t.appType === 'shop')),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  getThemesCollection(dto: PebThemeGetCollectionDto): Observable<PebTheme[]> {
    return of(null);
    // const url = `${this.builderApi}/themes/${this.businessId}/${this.applicationId}`;
    //
    // return this.httpClient.get(url, dto).pipe(
    //   map((themes: any[]) => themes.map(toClientTheme))
    // )
  }

  updateReplicas(masterId: PebPageId, replicas: PebPageId[]): Observable<unknown> {
    const url = `${this.builderApi}/replication/${masterId}`;

    return this.httpClient.post(url, { replicas });
  }

  getActiveTheme(): Observable<PebTheme> {
    const url = `${this.builderApi}/themes/${this.businessId}/${this.applicationId}`;
    const params = { active: 'true' };

    return this.httpClient.get(url, { params }).pipe(
      map((value: any[]) => {
        return value.length ? toClientTheme(value[0]) : null;
      }),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  getTheme(themeId: PebThemeId): Observable<PebTheme> {
    const url = `${this.builderApi}/themes/id/${themeId}`;

    return this.httpClient.get<any>(url).pipe(
      map(toClientTheme),
      map(theme => {
        if (!theme) {
          throw new Error('No such theme');
        }

        return theme;
      }),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  updateTheme(themeId: PebThemeId, theme: PebThemeUpdateDto): Observable<PebTheme> {
    const url = `${this.builderApi}/themes/${themeId}`;

    return this.httpClient.patch<any>(url, theme).pipe(
      map(toClientTheme),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  installTemplate(businessId: string, appId: string, templateId: string): Observable<PebTheme> {
    const url = `${this.builderApi}/themes/install-template/${templateId}`;

    const dto: PebInstallTemplateDto = {
      businessId,
      appId,
    };

    return this.httpClient.post(url, dto).pipe(
      map(toClientTheme),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  deleteTheme(themeId: PebThemeId): Observable<PebTheme> {
    const url = `${this.builderApi}/themes/${themeId}`;

    return this.httpClient.delete<any>(url).pipe(
      map(toClientTheme),
      catchError( err => {
        return this.errorHandler(err);
      }),
    );
  }

  getPage(themeId: PebThemeId, pageId: PebPageId): Observable<PebPage> {
    const url = `${this.builderApi}/pages/${pageId}`;

    return this.httpClient.get<any>(url).pipe(
      map(toClientPage),
      map(hotfixForPages),
      catchError( err => {
        return this.errorHandler(err);
      }),
    );
  }

  getPageStatus(pageId: PebPageId): Observable<PebPageStatus> {
    const url = `${this.builderApi}/pages/${pageId}/status`;

    return this.httpClient.get<any>(url);
  }

  createPage(themeId: PebThemeId, pageCreateDto: PebPageCreateDto): Observable<PebPage> {
    const url = `${this.builderApi}/pages`;
    const payload = { ...omit(pageCreateDto, 'id'), _id: pageCreateDto.id };

    return this.httpClient.post<any>(url, payload).pipe(
      map(toClientPage),
      map(hotfixForPages),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  copyPages(copePagesDto: PebPagesCopyMultipleDto): Observable<PebPageId[]> {
    const url = `${this.builderApi}/pages/copy`;

    return this.httpClient.post<PebPageId[]>(url, copePagesDto) ;
  }

  updatePage(dto: PebPageEditDto): Observable<PebPage> {
    const payload = { ...omit(dto, 'id'), _id: dto.id };
    const url = `${this.builderApi}/pages/${dto.id}`;

    return this.httpClient.patch<any>(url, payload).pipe(
      map(toClientPage),
      map(hotfixForPages),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  deletePage(themeId: PebThemeId, page: PebPageId): Observable<null> {
    return throwError('Not implemented yet');
  }

  updatePageActions(pageId: PebPageId, actions: PebElementUpdateAction[]): Observable<PebActionsHash> {
    const url = `${this.builderApi}/pages/${pageId}/actions`;
    const payload = actions.map(toServerAction);

    return this.httpClient.put<PebActionsHash>(url, payload);
  }

  addActions(pageId: PebPageId, actions: PebElementAppendAction[]): Observable<PebActionsHash> {
    const url = `${this.builderApi}/pages/${pageId}/actions`;
    const payload = actions.map(toServerAction);

    return this.httpClient.post<PebActionsHash>(url, payload);
  }

  deleteAction(pageId: PebPageId, actionId: PebActionId): Observable<PebActionsHash> {
    const url = `${this.builderApi}/pages/${pageId}/actions/${actionId}`;

    return this.httpClient.delete<PebActionsHash>(url);
  }

  getVersions(themeId: PebThemeId): Observable<PebVersionShort[]> {
    const url = `${this.builderApi}/versions`;
    const params = { applicationTheme: themeId };

    return this.httpClient.get<any>(url, { params }).pipe(
      map(versions => versions.map(toClientVersion)),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  getVersionById(themeId: PebThemeId): Observable<PebVersion> {
    return throwError('Not implmented');
  }

  createVersion(name: string, dto: PebVersionCreateDto): Observable<PebVersionShort> {
    const url = `${this.builderApi}/versions`;

    return this.httpClient.post<any>(url, dto).pipe(
      map(toClientVersion),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  installVersion(versionId: PebVersionId): Observable<any> {
    const url = `${this.builderApi}/versions/${versionId}/install`;

    return this.httpClient.put<any>(url, {}).pipe(
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  deleteVersion(versionId: PebVersionId): Observable<null> {
    const url = `${this.builderApi}/versions/${versionId}`;

    return this.httpClient.delete<any>(url);
  }

  publishVersion(versionId: PebVersionId): Observable<PebVersionShort> {
    const url = `${this.builderApi}/versions/${versionId}`;

    return this.httpClient.patch<any>(url, { published: true }).pipe(
      map(version => toClientVersion(omit(version, ['pages']) as any)),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  private errorHandler(error: any, showSnack?: boolean): Observable<never> {
    if (error.status === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.snackbarService.open(SnackbarComponent, error.message);
    }
    return throwError(error);
  }
}

const hotfixForPages = (page: PebPage) => ({
  ...page,
  snapshot: updateElements(page.snapshot),
  actions: page.actions.map(act => {
    if (act.type === PebDocumentInitActionName) {
      // tslint:disable-next-line:no-string-literal
      act.payload['content'] = updateElements(act.payload['content']);
    }

    return act;
  }),
});

// tslint:disable
const updateElements = (element: PebElement) => {
  if (!element) {
    return element;
  }

  if (!element.type && element['component']) {
    element.type = element['component'];
  }

  if (element['_id'] && !element.id) {
    element.id = element['_id'];
  }

  if (element.type === PebElementType.Text) {
    const width: any = element.style && element.style.width;
    if (width) {
      if (typeof width === 'number') {
        (element.style as any).width += 4;
      } else {
        Object.keys(element.style.width).forEach(k => element.style.width[k] += 4);
      }
    }
  }

  return {
    ...element,
    children: element.children.map(el => updateElements(el)),
  };
};
