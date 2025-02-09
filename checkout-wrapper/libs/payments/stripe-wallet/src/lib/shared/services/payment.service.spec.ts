import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  PaymentStatusEnum,
} from '@pe/checkout/types';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { PaymentService } from './payment.service';
import { StripeFlowService } from './stripe-flow.service';


describe('PaymentService', () => {
  let service: PaymentService;
  let nodeFlowService: NodeFlowService;
  let stripeFlowService: StripeFlowService;

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
        StripeFlowService,
      ],
    });
    service = TestBed.inject(PaymentService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    stripeFlowService = TestBed.inject(StripeFlowService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(service).toBeTruthy();
      expect(service instanceof AbstractPaymentService).toBeTruthy();
      expect(nodeFlowService).toBeTruthy();
    });
  });

  describe('service', () => {
    it('postPayment', (done) => {
      const response = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        null,
      );
      const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
        .mockReturnValue(of(null));
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(response));
      const postPaymentSpy = jest.spyOn(stripeFlowService, 'postPayment');
      service.postPayment().subscribe((res) => {
        expect(res).toEqual(response);
        expect(assignPaymentDetails).toHaveBeenCalledWith({});
        expect(postPayment).toHaveBeenCalledTimes(1);
        expect(postPaymentSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
