import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  FlowState,
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

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
      const flow = store.selectSnapshot(FlowState.flow);
      const env = TestBed.inject(PE_ENV);
      const localeConstantsService = TestBed.inject(LocaleConstantsService);
      const postBackURL = `${env.frontend.checkoutWrapper}/${localeConstantsService.getLang()}/pay/${flow.id}/redirect-to-payment`;

      const response = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        null,
      );
      const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
        .mockReturnValue(of(null));
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(response));
      instance.postPayment().subscribe((res) => {
        expect(res).toEqual(response);
        expect(assignPaymentDetails).toHaveBeenCalledWith({
          postbackUrl: postBackURL,
        });
        expect(postPayment).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
