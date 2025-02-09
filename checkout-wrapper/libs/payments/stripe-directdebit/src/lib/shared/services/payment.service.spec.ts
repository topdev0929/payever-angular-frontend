import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  PollUpdatePayment,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  PaymentStatusEnum,
} from '@pe/checkout/types';


import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let instance: PaymentService;
  let nodeFlowService: NodeFlowService;

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

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
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
      const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
        .mockReturnValue(null);
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(of(response));
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(null));
      instance.postPayment().subscribe((res) => {
        expect(res).toEqual(response);
        expect(assignPaymentDetails).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(new PollUpdatePayment(
          Object.values(PaymentStatusEnum).filter(status => status !== PaymentStatusEnum.STATUS_IN_PROCESS),
        ));
        done();
      });
      expect(postPayment).toHaveBeenCalledTimes(1);
    });
  });
});
