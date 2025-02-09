import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  const nodeFlowServiceSpy: jest.Mocked<any> = {
    postPayment: jest.fn().mockReturnValue(of(null)),
    assignPaymentDetails: jest.fn(),
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
        imports: [
          ...CommonImportsTestHelper(),
        ],
        providers: [
          ...CommonProvidersTestHelper(),
          NodeFlowService,
          PaymentService,
        ],
    });

    paymentService = TestBed.inject(PaymentService);
    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  it('should post payment successfully', () => {
    const flowData = flowWithPaymentOptionsFixture();
    const responseMock = {
      paymentDetails: { wizardSessionKey: 'SessionKey' },
      payment: { status: 'STATUS_NEW' },
    };

    nodeFlowServiceSpy.postPayment.mockReturnValueOnce(of(responseMock));

    paymentService.postPayment().subscribe((response) => {
      expect(response).toEqual(responseMock);
      expect(nodeFlowServiceSpy.assignPaymentDetails).toHaveBeenCalledWith({
        recipientHolder: flowData.businessName,
        recipientIban: flowData.businessIban,
      });
    });
  });

  it('should not post payment if response conditions are not met', () => {
    nodeFlowServiceSpy.postPayment.mockReturnValueOnce(of({}));

    paymentService.postPayment().subscribe({
      next: () => fail('Should not have been called'),
      error: () => fail('Should not have thrown an error'),
      complete: () => {
        expect(nodeFlowServiceSpy.assignPaymentDetails).not.toHaveBeenCalled();
      },
    });
  });
});
