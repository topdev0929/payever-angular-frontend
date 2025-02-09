import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { BuilderApi } from '../../core/api/builder-api.service';
import { ThemeCategoryIndustryInterface } from '../../core/core.entities';

/**
 * @deprecated
 * TODO(@dmlukichev): Make more reusable
 */
@Injectable({ providedIn: 'root' })
export class ThemesUserResolver implements Resolve<ThemeCategoryIndustryInterface[]> {
  constructor(private builderApi: BuilderApi) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const businessId = route.parent.params.businessId;
    const applicationId = route.parent.params.appId;

    return this.builderApi.getAppThemes({ businessId, applicationId, populateCurrentVersion: false });
  }
}
