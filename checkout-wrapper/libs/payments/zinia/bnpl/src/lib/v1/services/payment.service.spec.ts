import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  FlowState,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  FlowInterface,
  PaymentStatusEnum,
} from '@pe/checkout/types';


import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../test/fixtures';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let instance: PaymentService;
  let nodeFlowService: NodeFlowService;
  let nodeApiService: NodeApiService;
  let externalRedirectStorage: ExternalRedirectStorage;
  let topLocationService: TopLocationService;
  let flow: FlowInterface;

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentService,
        NodeFlowService,
      ],
    });
    instance = TestBed.inject(PaymentService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    nodeApiService = TestBed.inject(NodeApiService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
    topLocationService = TestBed.inject(TopLocationService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    flow = store.selectSnapshot(FlowState.flow);

  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
      expect(instance instanceof AbstractPaymentService).toBeTruthy();
      expect(nodeFlowService).toBeTruthy();
    });
  });

  describe('service', () => {
    it('postPayment', (done) => {
      const response = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        null,
      );
      const saveDataBeforeRedirect = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
        .mockReturnValue(of(null));
      const getShopUrls = jest.spyOn(nodeApiService, 'getShopUrls')
        .mockReturnValue(of({
          id: 'id',
          successUrl: null,
          failureUrl: null,
          cancelUrl: null,
        }));
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(response));
      const href = jest.spyOn(topLocationService, 'href', 'set')
        .mockImplementation(() => null);
      instance.postPayment().subscribe((res) => {
        expect(res).toEqual(response);
        done();
      });
      expect(saveDataBeforeRedirect).toHaveBeenCalledTimes(1);
      expect(getShopUrls).toHaveBeenCalledTimes(1);
      expect(saveDataBeforeRedirect).toHaveBeenCalledWith(flow);
      expect(postPayment).toHaveBeenCalledTimes(1);
      expect(getShopUrls).toHaveBeenCalledWith(flow);
      expect(href).toHaveBeenCalledTimes(1);
      expect(href).toHaveBeenCalledWith(response.paymentDetails.redirectUrl);
    });
  });
});
