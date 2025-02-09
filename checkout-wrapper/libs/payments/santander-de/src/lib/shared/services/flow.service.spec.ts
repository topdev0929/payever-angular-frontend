import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';
import { SendDocument } from '../types';

import { SantanderDeApiService } from './api.service';
import { SantanderDeFlowService } from './flow.service';

describe('SantanderDeFlowService', () => {
  let service: SantanderDeFlowService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDeFlowService,
        NodeFlowService,
        SantanderDeApiService,
      ],
    });

    service = TestBed.inject(SantanderDeFlowService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  describe('Constructor', () => {
    it('Should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('service', () => {
    it('should sendDocuments', () => {
      const flow = flowWithPaymentOptionsFixture();
      const docs: SendDocument[] = [];
      const paymentId = 'payment-id';
      const sendDocuments = jest.spyOn(SantanderDeApiService.prototype, 'sendDocuments');
      jest.spyOn(NodeFlowService.prototype, 'getFinalResponse').mockReturnValue({
        id: paymentId,
      } as NodePaymentResponseInterface<any>);
      service.sendDocuments(docs);
      expect(sendDocuments).toBeCalledWith(docs, 
        paymentId, 
        flow.id,
        flow.paymentOptions[0].paymentMethod,
        flow.connectionId
      );
    });
  });
});
