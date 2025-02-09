import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PeFeatureFlag, PeFeatureFlagService } from '@pe/feature-flag';
import { BuilderThemeApi } from '../../+builder/api/theme.api';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsResolver implements Resolve<PeFeatureFlag[]> {

  constructor(
    private themeApi: BuilderThemeApi,
    private featureFlagService: PeFeatureFlagService,
  ) {
  }

  resolve(): Observable<PeFeatureFlag[]> {
    return this.themeApi.getFeatureFlags().pipe(
      tap((flags: PeFeatureFlag[]) => this.featureFlagService.features = flags),
    );
  }


}
