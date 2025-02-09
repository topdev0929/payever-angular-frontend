import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  FlowState,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { RateInterface } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { RatesApiService } from './rates-api.service';
import { RatesService } from './rates.service';


describe('RatesService', () => {
  let instance: RatesService;

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesApiService,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    instance = TestBed.inject(RatesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('getRates', (done) => {
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      const result: RateInterface[] = [
        {
          listTitle: 'list-title',
          selectedTitle: 'selected-title',
          selectedMultiTitles: [],
          details: [],
          value: null,
          raw: null,
        },
      ];
      const calculateRates = jest.spyOn(RatesApiService.prototype, 'calculateRates')
        .mockReturnValue(of(result));
      instance.getRates().pipe(
        tap((res) => {
          expect(calculateRates).toBeCalledWith(flow, paymentMethod, {
            amount: String(flow.amount),
          });
          expect(res).toEqual(result);
          done();
        })
      ).subscribe();
    });

    it('should get rates from cache', (done) => {
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      const result: RateInterface[] = [
        {
          listTitle: 'list-title',
          selectedTitle: 'selected-title',
          selectedMultiTitles: [],
          details: [],
          value: null,
          raw: null,
        },
      ];
      instance['cache'] = {
        [flow.amount.toString()]: result,
      } as any;
      const calculateRates = jest.spyOn(RatesApiService.prototype, 'calculateRates')
        .mockReturnValue(of(result));
      instance.getRates().pipe(
        tap((res) => {
          expect(res).toEqual(result);
          expect(calculateRates).not.toBeCalledWith(flow, paymentMethod, {
            amount: String(flow.amount),
          });
          done();
        })
      ).subscribe();
    });
  });
});
