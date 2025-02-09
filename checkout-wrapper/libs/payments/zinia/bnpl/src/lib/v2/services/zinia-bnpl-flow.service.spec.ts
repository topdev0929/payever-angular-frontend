import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService } from '@pe/checkout/api';
import {
  FlowState,
  SetFlow,
  GetApiCallData,
  PatchPaymentResponse,
  SetPaymentComplete,
  PaymentState,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  NodePaymentResponseInterface,
  PaymentInterface,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { ZiniaBNPLApiService } from './zinia-bnpl-api.service';
import { ZiniaBnplFlowService } from './zinia-bnpl-flow.service';

describe('ZiniaBnplFlowService', () => {
  let store: Store;

  let instance: ZiniaBnplFlowService;
  let ziniaBnplApiService: ZiniaBNPLApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ZiniaBnplFlowService,
        ZiniaBNPLApiService,
        MockProvider(ApiService),
      ],
    });
    instance = TestBed.inject(ZiniaBnplFlowService);
    ziniaBnplApiService = TestBed.inject(ZiniaBNPLApiService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse(PaymentResponseWithStatus(
      PaymentStatusEnum.STATUS_NEW,
      null,
    )));

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
    const paymentMethod = PaymentMethodEnum.ZINIA_BNPL;
    const response = PaymentResponseWithStatus(
      PaymentStatusEnum.STATUS_NEW,
      null,
    );
    const data: PaymentInterface = {
      id: 'payment-id',
    };

    describe('optVerify', () => {
      it('should optVerify perform correctly', fakeAsync(() => {
        const optVerify = jest.spyOn(ziniaBnplApiService, 'optVerify')
          .mockReturnValue(of(response));
        const dispatch = jest.spyOn(store, 'dispatch')
          .mockReturnValue(of(null));
        const flow = store.selectSnapshot(FlowState.flow);

        instance.optVerify(flow.id, paymentMethod, data).toPromise();
        tick();
        expect(optVerify).toHaveBeenCalledWith(flow.id, paymentMethod, flow.connectionId, data);
        expect(dispatch).toHaveBeenCalledWith(new GetApiCallData(response));
      }));

      it('should optVerify perform correctly if apiCallId not found', fakeAsync(() => {
        const expectedResponse: NodePaymentResponseInterface<any> = {
          ...response,
          payment: {
            ...response.payment,
            apiCallId: null,
          },
        };
        const optVerify = jest.spyOn(ziniaBnplApiService, 'optVerify')
          .mockReturnValue(of(expectedResponse));
        const dispatch = jest.spyOn(store, 'dispatch')
          .mockReturnValue(of(null));
        const flow = store.selectSnapshot(FlowState.flow);

        instance.optVerify(flow.id, paymentMethod, data).toPromise();
        tick();
        expect(optVerify).toHaveBeenCalledWith(flow.id, paymentMethod, flow.connectionId, data);
        expect(dispatch).toHaveBeenCalledWith(new PatchPaymentResponse(expectedResponse));
      }));
    });

    describe('updateInfo', () => {
      it('should updateInfo perform correctly', (done) => {
        const flow = store.selectSnapshot(FlowState.flow);

        const updateInfo = jest.spyOn(ziniaBnplApiService, 'updateInfo')
          .mockReturnValue(of(response));
        const dispatch = jest.spyOn(store, 'dispatch')
          .mockReturnValue(of(null));

        instance.updateInfo().toPromise();
        expect(updateInfo)
          .toHaveBeenCalledWith(flow.id, paymentMethod, flow.connectionId, response.id, expect.any(Object));
        expect(updateInfo).toHaveBeenCalled();
        store.selectOnce(PaymentState.response).subscribe({
          next: (resp) => {
            done();
            expect(dispatch)
              .toHaveBeenNthCalledWith(1, new PatchPaymentResponse(resp));
            expect(dispatch)
              .toHaveBeenNthCalledWith(2, new SetPaymentComplete());
          },
        });
      });

      it('should updateInfo perform correctly if apiCallId not found', fakeAsync(() => {
        const expectedResponse: NodePaymentResponseInterface<any> = {
          ...response,
          payment: {
            ...response.payment,
            apiCallId: null,
          },
        };
        const flow = store.selectSnapshot(FlowState.flow);

        const updateInfo = jest.spyOn(ziniaBnplApiService, 'updateInfo')
          .mockReturnValue(of(expectedResponse));
        const dispatch = jest.spyOn(store, 'dispatch')
          .mockReturnValue(of(null));

        instance.updateInfo().toPromise();
        expect(updateInfo)
          .toHaveBeenCalledWith(flow.id, paymentMethod, flow.connectionId, response.id, expect.any(Object));
        expect(updateInfo).toHaveBeenCalled();
        expect(dispatch)
          .toHaveBeenNthCalledWith(1, new PatchPaymentResponse(expectedResponse));
        expect(dispatch)
          .toHaveBeenNthCalledWith(2, new SetPaymentComplete());

      }));
    });
  });
});

