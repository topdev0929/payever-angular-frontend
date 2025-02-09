import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebTemplateGetCollectionDto, PebTheme, PebThemeType } from '@pe/builder-core';
import { ThemeData } from '../../core/theme.data';
import { BuilderThemeApi } from '../api/theme.api';

@Injectable({ providedIn: 'root' })
export class BuilderThemeResolver implements Resolve<PebTheme> {
  constructor(
    private router: Router,
    private themeApi: BuilderThemeApi,
    private themeData: ThemeData,
  ) {}

  resolve(
    routeSnapshot: ActivatedRouteSnapshot,
    route: RouterStateSnapshot,
  ): Observable<any> {
    const themeId = routeSnapshot.queryParams.themeId;
    const themeType: PebThemeType = routeSnapshot.queryParams.type;
    const category: string = routeSnapshot.queryParams.category;
    const sortBy: string = routeSnapshot.queryParams.sortBy;

    // if specific theme has been requested, we open it
    if (themeId) {
      if (themeType === PebThemeType.System) {
        const dto = {
          appType: PebThemeType.System,
          id: themeId,
          category,
          sortBy,
        };

        return this.themeApi.getTemplates(dto).pipe(
          map((systemThemes: PebTheme[]) => systemThemes.length ? systemThemes[0] : null),
        );
      }

      return this.themeApi.getTheme(themeId);
    }

    // otherwise we fetch active theme
    return this.themeApi.getActiveTheme();
  }
}
