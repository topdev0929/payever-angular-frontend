import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { FlowState, GetApiCallData, PatchPaymentResponse, PaymentState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  NodePaymentResponseInterface,
  PaymentInterface,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';


import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';

import { OpenbankApiService } from './openbank-api.service';
import { OpenbankFlowService } from './openbank-flow.service';

describe('OpenbankFlowService', () => {
  let store: Store;

  let instance: OpenbankFlowService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        OpenbankFlowService,
        OpenbankApiService,
      ],
    });
    instance = TestBed.inject(OpenbankFlowService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse(PaymentResponseWithStatus(null, null)));
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
    it('optVerify with apiCallID', (done) => {
      const response = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        null,
      );
      const optVerify = jest.spyOn(TestBed.inject(OpenbankApiService), 'optVerify')
        .mockReturnValue(of(response));
      const data: PaymentInterface = {
        id: 'payment-id',
      };
      const flow = store.selectSnapshot(FlowState.flow);
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(of(null));

      instance.optVerify('flow-id', PaymentMethodEnum.ZINIA_BNPL, data).pipe(
        take(1),
        tap(() => {
          expect(dispatch).toHaveBeenCalledWith(new GetApiCallData(response));
          done();
        }),
      ).subscribe();

      expect(optVerify).toHaveBeenCalledWith('flow-id', PaymentMethodEnum.ZINIA_BNPL, flow.connectionId, data);
    });

    it('optVerify without apiCallID', (done) => {
      const response = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        null,
      );
      response.payment.apiCallId = null;
      const optVerify = jest.spyOn(TestBed.inject(OpenbankApiService), 'optVerify')
        .mockReturnValue(of(response));
      const data: PaymentInterface = {
        id: 'payment-id',
      };
      const flow = store.selectSnapshot(FlowState.flow);
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(of(null));


      instance.optVerify('flow-id', PaymentMethodEnum.ZINIA_BNPL, data).pipe(
        take(1),
        tap(() => {
          expect(dispatch).toHaveBeenCalledWith(new PatchPaymentResponse(response));
          done();
        }),
      ).subscribe();

      expect(optVerify).toHaveBeenCalledWith('flow-id', PaymentMethodEnum.ZINIA_BNPL, flow.connectionId, data);
    });

    it('updateInfo with apiCallID', (done) => {
      const paymentResponse = store.selectSnapshot(PaymentState.response);
      const response = {
        ...paymentResponse,
        paymentDetails: {
          some_value: 'some_value',
        },
      };
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      const paymentPayload = store.selectSnapshot(PaymentState.paymentPayload);
      const updateInfo = jest.spyOn(OpenbankApiService.prototype, 'updateInfo')
        .mockReturnValue(of(response));
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(of(null));
      instance.updateInfo().pipe(
        tap(() => {
          expect(updateInfo).toHaveBeenCalledWith(
            flow.id,
            paymentMethod,
            flow.connectionId,
            paymentResponse.id,
            paymentPayload,
          );
          expect(dispatch).toHaveBeenCalledWith(new GetApiCallData(response));
          done();
        }),
      ).subscribe();
    });

    it('updateInfo without apiCallID', (done) => {
      const paymentResponse = store.selectSnapshot(PaymentState.response);
      const response: NodePaymentResponseInterface<unknown> = {
        ...paymentResponse,
        payment: {
          ...paymentResponse.payment,
          apiCallId: null,
        },
      };
      const flow = store.selectSnapshot(FlowState.flow);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      const paymentPayload = store.selectSnapshot(PaymentState.paymentPayload);
      const updateInfo = jest.spyOn(OpenbankApiService.prototype, 'updateInfo')
        .mockReturnValue(of(response));
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(of(null));
      instance.updateInfo().pipe(
        tap(() => {
          expect(updateInfo).toHaveBeenCalledWith(
            flow.id,
            paymentMethod,
            flow.connectionId,
            paymentResponse.id,
            paymentPayload,
          );
          expect(dispatch).toHaveBeenCalledWith(new PatchPaymentResponse(response));
          done();
        }),
      ).subscribe();
    });
  });
});

