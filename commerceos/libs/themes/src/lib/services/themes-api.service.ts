/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { saveAs } from 'file-saver';
import { Observable, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebEnvService, PebPaginationParams, PebThemeEntity } from '@pe/builder/core';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { PeThemeTypesEnum, PeThemesRequestsErrorsEnum } from '../enums';

export const THEMES_API_PATH = new InjectionToken<string>('THEMES_API_PATH');

@Injectable({ providedIn: 'any' })
export class ThemesApi {
  public applicationId: string;

  constructor(
    private apmService: ApmService,
    private httpClient: HttpClient,
    private pebEnvService: PebEnvService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private env: PeAppEnv,
  ) {
  }

  private get applicationPath(): string {
    return `${this.env.builder}/api/business/${this.env.business}/application/${this.env.id}`;
  }

  public getThemesList(): Observable<any> {
    return this.httpClient
      .get(`${this.applicationPath}/themes`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemesList, error, true);

          return throwError(error);
        }));
  }

  public getTemplateList(filters: Array<{ field: string, condition: string, value: string }> = []): Observable<any> {
    const params: { [key: string]: string | string[] } = {};
    filters.forEach((filter, i) => {
      Object.entries(filter).forEach(([key, value]) => {
        params[`filters[${i}][${key}]`] = value;
      });
    });

    return this.httpClient
      .get(`${this.applicationPath}/theme/template`, { params })
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetTemplateList, error, true);

          return throwError(error);
        }));
  }

  public getThemeById(themeId: string): Observable<any> {
    return this.httpClient
      .get(`${this.env.builder}/api/theme/${themeId}`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeById, error, true);

          return throwError(error);
        }));
  }

  public updateTheme(themeId: string, themeData: {
    name: string,
    type: PeThemeTypesEnum,
    picture: string,
  }): Observable<any> {
    return this.httpClient
      .patch(`${this.env.builder}/api/theme/${themeId}`, themeData)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.UpdateTheme, error, true);

          return throwError(error);
        }));
  }

  public downloadTheme(themeId: string, fileName: string): Observable<any> {
    return this.httpClient
      .get(`${this.env.builder}/api/theme/${themeId}/export`, {
        responseType: 'blob',
      }).pipe(
        tap((resp) => {
          saveAs(resp, fileName);
        }),
        take(1),
      );
  }

  public exportPagesToShopify(themeId: string): Observable<any> {
    return this.httpClient
      .post(`${this.env.builder}/api/business/${this.env.business}/thirdparty-files/pages/export`, {
        themeId,
      }).pipe(
        take(1),
      );
  }

  public importTheme(file: any, folderId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.httpClient
      .post(`${this.env.builder}/api/business/${this.env.business}/application/${this.env.id}/folder/${folderId}/import`, formData)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.ExportTheme, error, true);

          return throwError(error);
        }));
  }

  public getThirdpartyFiles(): Observable<any> {
    return this.httpClient
      .get(`${this.env.builder}/api/business/${this.env.business}/thirdparty-files`)
      .pipe(
        catchError((error) => {
          return throwError(error);
        }));
  }

  public getThirdpartyFilePages(fileId: string): Observable<any> {
    return this.httpClient
      .get(`${this.env.builder}/api/business/${this.env.business}/thirdparty-files/file/${fileId}/pages`)
      .pipe(
        catchError((error) => {
          return throwError(error);
        }));
  }

  public importThirdpartyFileAsTheme(fileId: string, folderId: string): Observable<any> {
    return this.httpClient
      .post(`${this.env.builder}/api/business/${this.env.business}/thirdparty-files/application/${this.env.id}/folder/${folderId}/import`, {
        fileId,
      })
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.ImportThirdpartyFileAsTheme, error, true);

          return throwError(error);
        }));
  }

  public importThirdpartyFileAsPages(themeId: string, fileId: string, pages: string[]): Observable<any> {
    return this.httpClient
      .post(`${this.env.builder}/api/business/${this.env.business}/thirdparty-files/theme/${themeId}/pages/import`, {
        fileId,
        pages,
      })
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.ImportThirdpartyFileAsPages, error, true);

          return throwError(error);
        }));
  }

  public getTemplateThemes({ offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.httpClient
      .get<any>(`${this.env.builder}/api/templates`, {
        params: { offset: offset.toString(), limit: limit.toString() },
      })
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetTemplateThemes, error, true);

          return throwError(error);
        }));
  }

  public getTemplateItemThemes(ids: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.httpClient
      .post<any>(`${this.env.builder}/api/template/themes`, { ids }, {
        params: { offset: offset.toString(), limit: limit.toString() },
      })
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetTemplateItemThemes, error, true);

          return throwError(error);
        }));
  }

  public getThemesByTemplateId(itemId: string[], { offset = 0, limit = 100 }: PebPaginationParams = {}): Observable<any> {
    return this.httpClient
      .post<any>(`${this.env.builder}/api/template/items`, { ids: itemId })
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemesByTemplateId, error, true);

          return throwError(error);
        }));
  }

  public duplicateTemplateTheme(themeId: string, folderId: string): Observable<PebThemeEntity> {
    return this.httpClient
      .post<PebThemeEntity>(
        `${this.applicationPath}/theme/${themeId}/duplicate`,
        folderId ? { folderId } : {},
      )
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DuplicateTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public deleteTemplateTheme(themeId: string): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.applicationPath}/theme/${themeId}`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DeleteTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public instantInstallTemplateTheme(themeId: string): Observable<PebThemeEntity> {
    return this.httpClient
      .put<PebThemeEntity>(`${this.applicationPath}/template/${themeId}/instant-setup`, {})
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.InstantInstallTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public installTemplateTheme(themeId: string): Observable<PebThemeEntity> {
    return this.httpClient
      .post<PebThemeEntity>(`${this.applicationPath}/theme/${themeId}/install`, {})
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.InstallTemplateTheme, error, true);

          return throwError(error);
        }));
  }

  public switchTemplateTheme(themeId: string): Observable<PebThemeEntity> {
    const { businessId } = this.pebEnvService;
    const url = `${this.env.builder}/api/business/${businessId}/application/${this.env.id}/theme/${themeId}/switch`;

    return this.httpClient.put<PebThemeEntity>(url, {}).pipe(
      catchError((error) => {
        this.errorHandler(PeThemesRequestsErrorsEnum.SwitchTemplateTheme, error, true);

        return throwError(error);
      }));
  }

  public createThemeAlbum(album: any): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}/theme-album`, album)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.CreateThemeAlbum, error, true);

          return throwError(error);
        }));
  }

  public updateThemeAlbum(albumId: string, album: any): Observable<any> {
    return this.httpClient
      .patch<any>(`${this.applicationPath}/theme-album/${albumId}`, album)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.UpdateThemeAlbum, error, true);

          return throwError(error);
        }));
  }

  public getThemeBaseAlbum(): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeBaseAlbum, error, true);

          return throwError(error);
        }));
  }

  public getThemeAlbumById(albumId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album/${albumId}`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeAlbumById, error, true);

          return throwError(error);
        }));
  }

  public getThemeAlbumByParent(albumId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album/parent/${albumId}`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeAlbumByParent, error, true);

          return throwError(error);
        }));
  }

  public getThemeAlbumByAncestor(albumId: string): Observable<any> {
    return this.httpClient
      .get<any>(`${this.applicationPath}/theme-album/ancestor/${albumId}`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeAlbumByAncestor, error, true);

          return throwError(error);
        }));
  }

  public deleteThemeAlbum(albumId: string): Observable<any> {
    return this.httpClient
      .delete<any>(`${this.applicationPath}/theme-album/${albumId}`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DeleteThemeAlbum, error, true);

          return throwError(error);
        }));
  }

  public getThemeByAlbum(
    albumId?: string,
    pagination?: PebPaginationParams,
    filters: Array<{ field: string, condition: string, value: string }> = []
  ): Observable<any> {
    const { offset = 0, limit = 100 } = pagination;
    const params: { [key: string]: string | string[] } = { offset: offset.toString(), limit: limit.toString() };
    if (albumId) {
      params.albumId = albumId;
    }

    return this.httpClient
      .get<any>(`${this.applicationPath}/theme/album`, { params })
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.GetThemeByAlbum, error, true);

          return throwError(error);
        }));
  }

  public linkThemeToAlbum(themeId: string, albumId?: string): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}/theme/${themeId}/album/${albumId}`, {})
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.LinkThemeToAlbum, error, true);

          return throwError(error);
        }));
  }

  public unlinkTheme(themeId: string): Observable<any> {
    return this.httpClient
      .delete<any>(`${this.applicationPath}/theme/${themeId}/album`)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.UnlinkTheme, error, true);

          return throwError(error);
        }));
  }

  public createApplicationTheme(name: string, folderId: string, theme: any): Observable<any> {
    const targetFolderId = folderId ? { targetFolderId: folderId } : {};

    return this.httpClient.post<any>(`${this.applicationPath}/theme/`, { content: theme, name, ...targetFolderId }).pipe(
      catchError((error) => {
        this.errorHandler(PeThemesRequestsErrorsEnum.CreateApplicationTheme, error, true);

        return throwError(error);
      }));
  }

  public duplicateThemeAlbum(payload: { albumIds: string[], parent?: string, prefix?: string }): Observable<any> {
    return this.httpClient
      .post<any>(`${this.applicationPath}/theme-album/duplicate`, payload)
      .pipe(
        catchError((error) => {
          this.errorHandler(PeThemesRequestsErrorsEnum.DuplicateThemeAlbum, error, true);

          return throwError(error);
        }));
  };

  private errorHandler(description: string, error: any, showWarning?: boolean): void {
    const errorDescription = this.translateService.translate(description);

    if (showWarning) {
      this.snackbarService.toggle(true, {
        content: errorDescription,
        duration: 15000,
        iconColor: '#E2BB0B',
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
    }
    this.apmService.apm.captureError(`${errorDescription} ms: ${JSON.stringify(error)}`);
  }
}
