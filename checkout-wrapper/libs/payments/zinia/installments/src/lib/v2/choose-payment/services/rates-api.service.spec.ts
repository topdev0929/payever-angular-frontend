import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType, TrackingService } from '@pe/checkout/api';
import { FlowState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, RateInterface } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { CalculateRatesDto } from '../models';

import { RatesApiService } from './rates-api.service';


describe('RatesApiService', () => {
  let store: Store;
  let instance: RatesApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    instance = TestBed.inject(RatesApiService);
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
      expect(instance instanceof AbstractApiService).toBe(true);
    });
  });

  const flowId = 'flow-id';
  const paymentMethod = PaymentMethodEnum.ZINIA_INSTALLMENT;
  const data: CalculateRatesDto = {
    amount: '100',
    downPayment: '10',
  };

  it('Should log error', (done) => {
    const flow = store.selectSnapshot(FlowState.flow);
    const doEmitApiError = jest.spyOn(TrackingService.prototype, 'doEmitApiError');
    instance.calculateRates(flow, paymentMethod, data).pipe(
      catchError(() => {
        expect(doEmitApiError).toHaveBeenCalledWith(
          flowId,
          paymentMethod,
          ApiErrorType.ErrorRates,
          expect.anything()
        );
        done();

        return of(null);
      }),
    ).subscribe();
    const requests = httpTestingController.match(() => true);
    requests.forEach(req => req.flush({
      error: 'server is not in the mood',
    }, { status: 500, statusText: 'internal server error' }));
  });

  it('Should verify-otp-code', () => {
    const flow = store.selectSnapshot(FlowState.flow);
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
    instance.calculateRates(flow, paymentMethod, data).pipe(
      tap(res => expect(res).toEqual(result)),
    ).subscribe();
    const url = `${env.thirdParty.payments}/api/connection/${flow.connectionId}/action/calculate-rates`;

    const req = httpTestingController.expectOne(url);
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(data);
    req.flush(result);
  });

});
