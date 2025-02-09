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
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(response));
      instance.postPayment().subscribe((res) => {
        expect(res).toEqual(response);
        done();
      });
      expect(postPayment).toHaveBeenCalledTimes(1);
    });
  });
});
