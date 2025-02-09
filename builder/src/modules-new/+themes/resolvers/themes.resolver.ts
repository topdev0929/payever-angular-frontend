import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { BuilderApi } from '../../core/api/builder-api.service';
import { ThemeCategoryIndustryInterface } from '../../core/core.entities';
import { ThemeData } from '../../core/theme.data';

/**
 * TODO(@dmlukichev): Make more reusable
 */
@Injectable({ providedIn: 'root' })
export class ThemesResolver implements Resolve<ThemeCategoryIndustryInterface[]> {
  constructor(private builderApi: BuilderApi, private themeData: ThemeData) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const category = route.params.category;

    // TODO(#backend): Expose industry when category is not defined
    return this.builderApi.getThemes({ category, type: this.themeData.applicationType });
  }
}
