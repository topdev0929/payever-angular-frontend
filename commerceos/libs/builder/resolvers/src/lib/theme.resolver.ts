import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder/api';
import { PebDefaultScreens, PebPage, PebScript, PebTheme, toPageDTO, toThemeDTO } from '@pe/builder/core';
import { PebSetTheme, PebEditorStateModel, PebSetScriptsAction, PebUpdateThemeScreens } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebThemeResolver implements Resolve<any> {

  constructor(
    private store: Store,
    private readonly api: PebEditorApi,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.resolveActiveTheme();
  }

  resolveActiveTheme(): Observable<any> {
    return this.api.getActiveTheme().pipe(
      switchMap(theme => this.resolveThemeById(theme.id, theme.versionNumber))
    );
  }

  resolveThemeById(themeId: string, versionNumber: number = 0): Observable<{ theme?: PebTheme, pages?: PebPage[], scripts?: PebScript[] }> {
    return forkJoin([
      this.api.getTheme(themeId).pipe(
        map((value: any) => toThemeDTO({ ...value, id: themeId, publishedVersion: versionNumber ?? 0 })),
      ),
      this.api.getPageList(themeId).pipe(
        map((pages: any[]) => pages.map(page => toPageDTO(page))),
      ),
      this.api.getScripts(themeId),
    ]).pipe(
      switchMap(([theme, pages, scripts]) => {
        const page = pages.reduce((acc, p) => {
          return { ...acc, [p.id]: { ...p, element: {} } };
        }, {});

        const state: PebEditorStateModel = {
          theme: { [theme.id]: { ...theme, page } },
          editText: { enabled: false },
        };

        return this.store.dispatch([
          new PebSetTheme(state),
          new PebSetScriptsAction(scripts),
        ]).pipe(
          tap(() => !theme.screens && this.store.dispatch(new PebUpdateThemeScreens(Object.values(PebDefaultScreens)))),
          map(() => ({ theme, pages, scripts })),
        );
      }),
      catchError((err) => {
        console.error(err);

        return of({});
      }),
    );
  }
}
