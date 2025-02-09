import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, NodeShopUrlsInterface, PaymentSpecificStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  const mockShopUrls: NodeShopUrlsInterface = {
    successUrl: 'mockSuccessUrl',
    failureUrl: 'mockFailureUrl',
    cancelUrl: 'mockCancelUrl',
  };

  let service: PaymentService;
  let nodeFlowService: NodeFlowService;
  let nodeApiService: NodeApiService;
  let topLocationService: TopLocationService;

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

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(PaymentService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    nodeApiService = TestBed.inject(NodeApiService);
    topLocationService = TestBed.inject(TopLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postPayment', () => {
    it('should post payment successfully', (done) => {
      const applicantSignReferenceUrl = 'https://applicantSignReferenceUrl.com';

      const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
      const topLocationServiceHrefSpy = jest.spyOn(topLocationService, 'href', 'set').mockImplementation(jest.fn());
      const getShopUrlsSpy = jest.spyOn(nodeApiService, 'getShopUrls').mockReturnValue(of(mockShopUrls));

      const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of({
          payment: {
            specificStatus: PaymentSpecificStatusEnum.STATUS_APPROVED,
          },
          paymentDetails: {
            applicantSignReferenceUrl,
          },
        } as NodePaymentResponseInterface<unknown>));

      service.postPayment().subscribe(() => {
        expect(getShopUrlsSpy).toHaveBeenCalled();
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(topLocationServiceHrefSpy).toHaveBeenCalled();
        expect(assignPaymentDetailsSpy).toHaveBeenCalledWith({
          frontendSuccessUrl: mockShopUrls.successUrl,
          frontendFailureUrl: mockShopUrls.failureUrl,
          frontendCancelUrl: mockShopUrls.cancelUrl,
        });
        done();
      });
    });

    it('should post payment handle if shopUrls not provided', (done) => {
      const applicantSignReferenceUrl = 'https://applicantSignReferenceUrl.com';

      const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
      const topLocationServiceHrefSpy = jest.spyOn(topLocationService, 'href', 'set').mockImplementation(jest.fn());
      const getShopUrlsSpy = jest.spyOn(nodeApiService, 'getShopUrls')
        .mockReturnValue(of({
          successUrl: null,
          failureUrl: null,
          cancelUrl: null,
        }));
      const checkoutWrapper = peEnvFixture().frontend.checkoutWrapper;
      const locale = 'en';
      const flowId = flowWithPaymentOptionsFixture().id;

      jest.spyOn(service['localeConstantService'], 'getLang').mockReturnValue(locale as any);

      const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of({
          payment: {
            specificStatus: PaymentSpecificStatusEnum.STATUS_APPROVED,
          },
          paymentDetails: {
            applicantSignReferenceUrl,
          },
        } as NodePaymentResponseInterface<unknown>));

      service.postPayment().subscribe(() => {
        expect(getShopUrlsSpy).toHaveBeenCalled();
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(topLocationServiceHrefSpy).toHaveBeenCalled();
        expect(assignPaymentDetailsSpy).toHaveBeenCalledWith({
          frontendSuccessUrl: `${checkoutWrapper}/${locale}/pay/${flowId}/static-finish/success`,
          frontendFailureUrl: `${checkoutWrapper}/${locale}/pay/${flowId}/static-finish/fail`,
          frontendCancelUrl: `${checkoutWrapper}/${locale}/pay/${flowId}/static-finish/cancel`,
        });
        done();
      });
    });
  });
});
