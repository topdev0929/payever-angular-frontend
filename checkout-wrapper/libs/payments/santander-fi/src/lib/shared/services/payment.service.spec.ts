import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, NodeShopUrlsInterface } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;
  let nodeFlowService: NodeFlowService;
  let nodeApiService: NodeApiService;
  let externalRedirectStorage: ExternalRedirectStorage;

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
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postPayment', () => {
    const checkoutWrapper = peEnvFixture().frontend.checkoutWrapper;
    const lang = 'en';
    const mockPaymentResponse = {
      paymentDetails: { redirectUrl: 'mockRedirectUrl' },
    } as NodePaymentResponseInterface<any>;
    const flowId = flowWithPaymentOptionsFixture().id;
    const mockShopUrls: NodeShopUrlsInterface = {
      cancelUrl: 'https://cancelUrl.com',
      failureUrl: 'https://failureUrl.com',
      successUrl: 'https://successUrl.com',
    };

    it('should handle successful postPayment', (done) => {
      const topLocationService = TestBed.inject(TopLocationService);

      jest.spyOn(topLocationService, 'href', 'set').mockImplementation(jest.fn());
      jest.spyOn(nodeApiService, 'getShopUrls').mockReturnValue(of(mockShopUrls));
      jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(undefined));
      const assignPaymentDetails = jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails');

      service.postPayment().subscribe(() => {
        expect(nodeApiService.getShopUrls).toHaveBeenCalledWith(service['flow']);
        expect(assignPaymentDetails).toHaveBeenCalledWith({
          frontendSuccessUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-payment`,
          frontendFinishUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-payment`,
          frontendFailureUrl: mockShopUrls.failureUrl,
        });
        expect(nodeFlowService.postPayment).toHaveBeenCalled();
        expect(externalRedirectStorage.saveDataBeforeRedirect).toHaveBeenCalledWith(service['flow']);
        done();
      });
    });

    it('should handle successful postPayment if shopUrls is not provided', (done) => {
      const topLocationService = TestBed.inject(TopLocationService);

      jest.spyOn(topLocationService, 'href', 'set').mockImplementation(jest.fn());
      jest.spyOn(service['localeConstantsService'], 'getLang').mockReturnValue(lang);
      jest.spyOn(nodeApiService, 'getShopUrls').mockReturnValue(of({
        cancelUrl: null,
        failureUrl: null,
        successUrl: null,
      }));
      jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(undefined));
      const assignPaymentDetails = jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails');


      service.postPayment().subscribe(() => {
        expect(nodeApiService.getShopUrls).toHaveBeenCalledWith(service['flow']);
        expect(assignPaymentDetails).toHaveBeenCalledWith({
          frontendSuccessUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-payment`,
          frontendFinishUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-payment`,
          frontendFailureUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-choose-payment`,
        });
        expect(nodeFlowService.postPayment).toHaveBeenCalled();
        expect(externalRedirectStorage.saveDataBeforeRedirect).toHaveBeenCalledWith(service['flow']);
        done();
      });
    });

    it('should throw an error if "redirectUrl" is empty in the backend response', (done) => {
      const mockPaymentResponse = {
        paymentDetails: { redirectUrl: '' },
      } as NodePaymentResponseInterface<any>;

      jest.spyOn(nodeApiService, 'getShopUrls').mockReturnValue(of(mockShopUrls));
      jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(undefined));

      service.postPayment().subscribe(
        jest.fn(),
        (error) => {
          expect(error).toEqual(new Error('The "redirectUrl" is empty in backend response'));
          done();
        },
      );
    });
  });
});
