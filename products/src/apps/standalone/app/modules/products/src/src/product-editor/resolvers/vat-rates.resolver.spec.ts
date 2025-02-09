import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { VatRateInterface } from '../interfaces';
import { VatRatesApiService } from '../services';
import { DEFAULT_VAT_RATE, VatRatesResolver } from './vat-rates.resolver';

describe('VatRatesResolver', () => {
  let vatRatesResolver: VatRatesResolver;

  let vatRatesServiceSpy: jasmine.SpyObj<VatRatesApiService>;
  let activatedRouteMock: ActivatedRouteSnapshot;

  beforeEach(() => {
      vatRatesServiceSpy = jasmine.createSpyObj('VatRatesApiService', ['getVarRates']);

      activatedRouteMock = {
        parent: {
          data: {
            business: {
              companyAddress: {
                country: 'DE',
              },
            },
          },
        },
      } as unknown as ActivatedRouteSnapshot;

      vatRatesResolver = new VatRatesResolver(vatRatesServiceSpy);
    });

  it('#resolve should return vat rates for current country', (done) => {
      const expectedRate: VatRateInterface = {
        rate: 11,
        description: 'description',
      } ;

      vatRatesServiceSpy.getVarRates.and.returnValue(new Observable((observer) => {
        observer.next([expectedRate]);
        observer.complete();
      }));

      vatRatesResolver.resolve(activatedRouteMock).subscribe((result: VatRateInterface[]) => {
        expect(result).toEqual([expectedRate]);
        done();
      });
    });

  it('resolve should return defauld vat rate if result is empty', (done) => {
      vatRatesServiceSpy.getVarRates.and.returnValue(new Observable((observer) => {
        observer.next([]);
        observer.complete();
      }));

      vatRatesResolver.resolve(activatedRouteMock).subscribe((result: VatRateInterface[]) => {
        expect(result).toEqual([DEFAULT_VAT_RATE]);
        done();
      });
    });
});
