import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, flatMap } from 'rxjs/operators';

import { SectionsService } from '../services';
import { ProductsApiService } from '../../shared/services/api.service';
import { EnvService } from '../../shared/services/env.service';
import { RecurringBillingDataInterface, RecurringBillingInterface } from '../../shared/interfaces/billing.interface';

@Injectable()
export class RecurringBillingResolver implements Resolve<boolean> {
  constructor(
    private api: ProductsApiService,
    private sectionsService: SectionsService,
    private envService: EnvService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    const productId: string = route.params.productId;
    return combineLatest([
      this.api.getBillingIntegrationConnectionStatus(this.envService.businessUuid),
      this.api.getBillingIntegrationDetails(),
    ]).pipe(
      flatMap(data => {
        const result: RecurringBillingInterface = {
          installed: data[0].installed,
          url: data[1].extension.url,
        };
        if (result.installed && productId) {
          this.sectionsService.setRecurringBillingLoading(true);
          this.api
            .getBillingIntegrationProduct(result.url, this.envService.businessUuid, productId)
            .pipe(catchError(() => of(null)))
            .subscribe((billingData: RecurringBillingDataInterface) => {
              result.enabled = !!billingData;
              if (billingData) {
                result.billingPeriod = billingData.billingPeriod;
                result.interval = billingData.interval;
              }
              this.sectionsService.setRecurringBilling(result);
              this.sectionsService.setRecurringBillingLoading(false);
            });
        } else {
          result.enabled = false;
          result.billingPeriod = null;
          result.interval = null;
          this.sectionsService.setRecurringBilling(result);
        }
        return of(true);
      }),
    );
  }
}
