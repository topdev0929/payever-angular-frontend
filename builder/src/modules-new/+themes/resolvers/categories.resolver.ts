import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { BuilderApi } from '../../core/api/builder-api.service';
import { ThemeCategoryIndustryInterface } from '../../core/core.entities';

@Injectable({ providedIn: 'root' })
export class CategoriesResolver implements Resolve<ThemeCategoryIndustryInterface[]> {
  constructor(private builderApi: BuilderApi) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.builderApi.getThemeCategories();
  }
}
