import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PebDocument, PebElement, pebMapElementDeep, PebPagesCopyMultipleDto, PebTheme } from '@pe/builder-core';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { TranslateService } from '@pe/ng-kit/modules/i18n';

import { SnackbarComponent } from '../../+builder/components/snackbar/snackbar.component';
import { SnackbarService } from '../../+builder/services/snackbar.service';
import {
  BaseThemeInterface,
  BaseThemeVersionInterface,
  RawThemeInterface,
  ThemeVersionWithPagesInterface,
} from '../core.entities';
import { CopyPagesDto } from '../dto/pages.dto';
import { GetAppThemesDto, ThemeCreateDto } from '../dto/theme.dto';
import { CreateVersionDto } from '../dto/version.dto';

@Injectable({ providedIn: 'root' })
export class BuilderApi {
  constructor(
    private config: EnvironmentConfigService,
    private http: HttpClient,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) {}

  get builderApi(): string {
    return `${this.config.getConfig().backend.builder}/api`;
  }

  getThemes(payload: { [key: string]: string }): Observable<any> {
    const params = Object.keys(payload).reduce((p, key) => p.append(key, payload[key]), new HttpParams());

    return this.http.get(`${this.builderApi}/themes`, { params }).pipe(
      // tslint:disable-next-line: no-string-literal
      map((themes: PebTheme[]) => themes.map(t => ({...t, id: t['_id']}))),
      map(themes => themes.filter(t => t.appType === 'shop')),
    );
  }

  // TODO check return type
  getThemeCategories(): Observable<any> {
    return this.http.get(`${this.builderApi}/category`).pipe(
      catchError(err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  //
  //  Basic fetchers
  //
  getAppThemes = (dto: GetAppThemesDto) => {
    const url = `${this.builderApi}/themes/${dto.businessId}/${dto.applicationId}`;
    const { businessId, applicationId, ...getParams } = dto;

    return this.http
      .get(url, {
        params: getParams as any,
      })
      .pipe(
        map((response: any[]) => response.map(({ _id, __v, ...props }) => ({ ...props, id: _id }))),
        map(themes => themes.filter(t => t.appType === 'shop')),
        catchError( err => {
          return this.errorHandler(err, true);
        }),
      );
  };

  postTheme = (
    businessId: string,
    appId: string,
    theme: RawThemeInterface,
    getPagesInResponse = false,
  ): Observable<BaseThemeInterface> => {
    const url = `${this.builderApi}/themes`;
    const createThemeDto = {
      businessId,
      appId,
      name: theme.name,
      type: theme.type,
      pages: theme.pages,
      active: theme.active,
      logo: theme.logo,
      appType: theme.appType,
    } as ThemeCreateDto;

    return this.http
      .post<BaseThemeInterface>(url, createThemeDto, {
        params: {
          withPages: getPagesInResponse ? 'true' : 'false',
        },
      })
      .pipe(
        map(({ _id, __v, ...themeProps }: any) => ({
          ...themeProps,
          id: _id,
        })),
        catchError( err => {
          return this.errorHandler(err, true);
        }),
      );
  };

  patchTheme = (themeId: string, theme: BaseThemeInterface): Observable<RawThemeInterface> => {
    const url = `${this.builderApi}/themes/${themeId}`;

    return this.http.patch<any>(url, theme).pipe(
      map(({ _id, __v, ...themeProps }) => ({
        ...themeProps,
        id: _id,
      })),
      catchError( err => {
        return this.errorHandler(err);
      }),
    );
  };

  patchVersion = version => {
    const url = `${this.builderApi}/versions/${version.id}`;

    return this.http.patch<any>(url, version).pipe(
      map(({ _id, __v, pages, ...themeProps }) => ({
        ...themeProps,
        id: _id,
        pages,
      })),
      catchError( err => {
        return this.errorHandler(err);
      }),
    );
  };

  deleteTheme = theme => {
    const url = `${this.builderApi}/themes/${theme.id}`;

    return this.http.delete(url);
  };

  copyPages(dto: PebPagesCopyMultipleDto): Observable<string[]> {
    const url = `${this.builderApi}/pages/copy`;

    return this.http.post<string[]>(url, dto);
  }

  getPage = (pageId: string): Observable<PebDocument> => {
    const url = `${this.builderApi}/pages/${pageId}`;

    return this.http.get(url).pipe(
      map(idsToUuids),
      catchError( err => {
        return this.errorHandler(err, true);
      }),
    );
  };

  getPages = (pageIds: string[]): Observable<PebDocument[]> => {
    return zip(...pageIds.map(pageId => this.getPage(pageId)));
  };

  // postPage = (page: PebDocument): Observable<PebDocument> => {
  //   const url = `${this.builderApi}/pages`;
  //   const payload = uuidsToIds(page);
  //
  //   return this.http.post(url, payload).pipe(map(idsToUuids));
  // };

  // patchPage = (page: PebDocument): Observable<PebDocument> => {
  //   const url = `${this.builderApi}/pages/${page.id}`;
  //   const payload = uuidsToIds(page);
  //
  //   return this.http.patch(url, payload).pipe(map(idsToUuids));
  // };

  getThemeVersions(applicationThemeId: string): Observable<BaseThemeVersionInterface[]> {
    const url = `${this.builderApi}/versions`;

    return this.http
      .get(url, {
        params: { applicationTheme: applicationThemeId },
      })
      .pipe(
        map((result: any[]) =>
          result.map(({ _id, __v, ...themeProps }) => ({
            id: _id,
            ...themeProps,
          })),
        ),
        catchError( err => {
          return this.errorHandler(err);
        }),
      );
  }

  postThemeVersion(createVersionDto: CreateVersionDto): Observable<ThemeVersionWithPagesInterface> {
    const url = `${this.builderApi}/versions`;

    return this.http.post<any>(url, createVersionDto).pipe(
      map(({ _id, __v, ...themeProps }) => ({
        id: _id,
        ...themeProps,
      })),
      catchError( err => {
        return this.errorHandler(err);
      }),
    );
  }

  getShopDomains(business: string, app: string): Observable<any> {
    const path = `${this.config.getBackendConfig().builder}/api/business/${business}/app/${app}/domain`;

    return this.http.get(
      path,
      {
        params: {
          all: 'true',
        },
      },
    )
      .pipe(
        map(domain => {
          return domain ? domain : null;
        }),
      );
  }

  // patchThemeVersion(themeVersion) {
  //   const url = `${this.builderApi}/versions/${themeVersion.id}`;
  //
  //   return this.http.patch<any>(url, themeVersion).pipe(
  //     map(({ _id, __v, ...themeProps }) => ({
  //       id: _id,
  //       ...themeProps,
  //     })),
  //   );
  // }

  // deleteThemeVersion(themeVersion) {
  //   const url = `${this.builderApi}/versions/${themeVersion.id}`;
  //
  //   return this.http.delete<any>(url).pipe(
  //     map(({ _id, __v, ...themeProps }) => ({
  //       id: _id,
  //       ...themeProps,
  //     })),
  //   );
  // }

  // getVersionContent(versionId: string) {
  //   const url = `${this.builderApi}/versions/${versionId}/content`;
  //
  //   return this.http.get(url);
  // }

  installTemplate(themeId: string, params: any) {
    return this.http.post(`${this.builderApi}/themes/install-template/${themeId}`, params);
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

  // patchElement(pageId: string, parentUuid: string, element: PebElement) {
  //   const url = `${this.builderApi}/pages/${pageId}/${parentUuid ? `${parentUuid}/` : ''}${element.id}`;
  //   return this.http.patch<any>(url, element);
  // }

  // deleteElement(pageId: string, uuid: string) {
  //   const url = `${this.builderApi}/pages/${pageId}/${uuid}`;
  //   return this.http.delete<any>(url);
  // }
}

// function uuidsToIds(element: any) {
//   return pebMapElementDeep(element, (el: any) => {
//     if (!el) {
//       return;
//     }
//
//     const { id, __v, ...elProps } = el;
//     return { _id: id, ...elProps };
//   });
// }

const idsToUuids = (element: any): PebDocument => {
  return pebMapElementDeep(element, (el: any) => {
    if (!el) {
      return;
    }
    const { _id, __v, ...elProps } = el;

    return { id: _id, ...elProps };
  });
};
