import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

import { ExternalNavigateData } from '@pe/checkout/storage';
import { MarkNextStep } from '@pe/checkout/store';

@Injectable({
  providedIn: 'root',
})
export class ExternalNavigateDataQueryGuard {

  private readonly store = inject(Store);
  private readonly externalNavigateData = inject(ExternalNavigateData);

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot) {
    const flowId = activatedRouteSnapshot.params.flowId;
    this.externalNavigateData.extractFromUrlAndSave(flowId);
    const queryParams = activatedRouteSnapshot.queryParams;

    if (queryParams.step) {
      return this.store.dispatch(new MarkNextStep(queryParams.step)).pipe(
        map(() => true),
      );
    }

    return true;
  }
}
