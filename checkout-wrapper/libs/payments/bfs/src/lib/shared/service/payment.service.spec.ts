import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { NodePaymentDetailsResponseInterface } from '../types';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
    let service: PaymentService;

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

        service = TestBed.inject(PaymentService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });


  it('should call postPayment on nodeFlowService and return the response', async () => {
    const mockResponse = {
        paymentDetails: {
            applicationNumber: 'test',
            frontendCancelUrl: 'https://frontendCancelUrl.com',
            frontendFinishUrl: 'https://frontendFinishUrl.com',
            getPaymentStatusUrl: 'https://getPaymentStatusUrl.com',
            redirectUrl: 'https://redirectUrl.com',
        },
    } as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

    const postPaymentSpy = jest.spyOn(service['nodeFlowService'], 'postPayment')
        .mockReturnValueOnce(of(mockResponse));

    const result = await service.postPayment().toPromise();
    expect(postPaymentSpy).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });
});
