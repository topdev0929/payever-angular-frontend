import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { cold } from 'jest-marbles';
import { ReplaySubject, of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../test';

import { SantanderDeApiService } from './api.service';
import { SantanderDeFlowService } from './flow.service';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let nodeFlowService: NodeFlowService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        HttpClientModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentService,
        NodeFlowService,
        SantanderDeFlowService,
        SantanderDeApiService,
      ],
    });

    service = TestBed.inject(PaymentService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  describe('Constructor', () => {
    it('Should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('postPayment() method', () => {
    it('should handle post payment', () => {
      const response = {
        some_vale: true,
      } as any;
      const paymentUpdate = jest.spyOn(
        SantanderDeFlowService.prototype,
        'runUpdatePaymentWithTimeout')
        .mockReturnValue(cold('(ppl|)', {
          p: {
            isCheckStatusProcessing: true,
            isWaitingForSignUrl: false,
            isUpdatePaymentTimeout: false,
          },
          l: {
            isCheckStatusProcessing: false,
            isWaitingForSignUrl: false,
            isUpdatePaymentTimeout: false,
          },
        }));
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(response));

      const replay$ = new ReplaySubject<any>();
      service.postPayment().subscribe(replay$);
      expect(replay$).toBeObservable(cold('(n|)', { n: response }));
      expect(postPayment).toHaveBeenCalled();
      expect(paymentUpdate).toHaveBeenCalled();
    });
  });
});
