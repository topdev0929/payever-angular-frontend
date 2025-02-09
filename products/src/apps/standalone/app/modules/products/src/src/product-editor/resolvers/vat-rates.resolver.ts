import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { VatRateInterface } from '../../shared/interfaces/section.interface';
import { EnvService } from '../../shared/services/env.service';
import { VatRatesApiService } from '../services';

export const DEFAULT_VAT_RATE: VatRateInterface = {
  description: 'Default taxes apply',
  rate: 0,
};

@Injectable()
export class VatRatesResolver implements Resolve<any[]> {
  constructor(
    private envService: EnvService,
    private vatRatesService: VatRatesApiService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<VatRateInterface[]> {
    return this.vatRatesService.getVarRates(this.envService.country).pipe(
      map((rates: VatRateInterface[]) => {
        if (rates.length === 0) {
          return [DEFAULT_VAT_RATE];
        }

        return rates;
      }),
    );
  }
}
