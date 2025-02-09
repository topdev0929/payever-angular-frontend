import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentPreInitializeData } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { StripeApiService } from './stripe-api.service';
import { StripeCommonService } from './stripe-common.service';
import { StripeFlowService } from './stripe-flow.service';


describe('StripeCommonService', () => {
  let instance: StripeCommonService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        StripeCommonService,
        StripeFlowService,
        StripeApiService,
      ],
    });
    instance = TestBed.inject(StripeCommonService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('initStripe', (done) => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      (window as any).Stripe = jest.fn().mockReturnValue({});
      const script: HTMLScriptElement = document.createElement('script');
      Object.defineProperty(script, 'onload', {
        set: (fn) => {
          fn();
        },
      });
      Object.defineProperty(script, 'onerror', {
        set: (fn) => {
          fn();
        },
      });

      jest.spyOn(document, 'createElement').mockReturnValue(script);
      const getStripeData = jest.spyOn(StripeFlowService.prototype, 'getStripeData')
        .mockReturnValue(of(response));
      instance.initStripe().pipe(
        tap((res) => {
          expect(res).toEqual({});
          expect(getStripeData).toHaveBeenCalled();
          expect((window as any).Stripe).toHaveBeenCalledWith(response.publishKey);
          done();
        }),
      ).subscribe();
    });

    it('should addScriptToPage return true', (done) => {
      const script: HTMLScriptElement = document.createElement('script');
      jest.spyOn(document, 'getElementById').mockReturnValue(script);

      instance['addScriptToPage']().subscribe((value) => {
        expect(value).toEqual(true);

        done();
      });
    });
  });

});
