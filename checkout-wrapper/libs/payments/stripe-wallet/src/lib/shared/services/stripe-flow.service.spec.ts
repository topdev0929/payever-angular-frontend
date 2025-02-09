import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { BaseNodeFlowService, NodeFlowService } from '@pe/checkout/node-api';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  NodePaymentPreInitializeData,
} from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { StripeApiService } from './stripe-api.service';
import { StripeFlowService } from './stripe-flow.service';

describe('StripeFlowService', () => {
  let service: StripeFlowService;
  let nodeFlowService: NodeFlowService;

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        StripeFlowService,
        NodeFlowService,
        StripeApiService,
      ],
    });
    service = TestBed.inject(StripeFlowService);
    nodeFlowService = TestBed.inject(NodeFlowService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(service).toBeTruthy();
      expect(service instanceof BaseNodeFlowService).toBeTruthy();
      expect(nodeFlowService).toBeTruthy();
    });
  });

  describe('service', () => {
    it('getStripeData', (done) => {
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      const paymentPublishKey = jest.spyOn(StripeApiService.prototype, 'paymentPreInitialize')
        .mockReturnValue(of(response));

        service.getStripeData().subscribe((result) => {
        expect(result).toEqual(response);
        done();
      });
      expect(paymentPublishKey).toHaveBeenCalled();
    });

    it('postPayment', () => {
      const next = jest.spyOn(service['postPaymentSubject$'], 'next');
      const state = true;
      service.postPayment(state);

      expect(next).toBeCalledWith(state);
    });
  });
});
