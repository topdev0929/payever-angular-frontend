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
import { LocaleConstantsService } from '@pe/checkout/utils';
import { DateUtilService } from '@pe/checkout/utils/date';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  const mockShopUrls: NodeShopUrlsInterface = {
    cancelUrl: 'https://cancelUrl.com',
    failureUrl: 'https://failureUrl.com',
    successUrl: 'https://successUrl.com',
  };

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
    it('should handle successful postPayment', (done) => {
      const mockPaymentResponse = {
        paymentDetails: { redirectUrl: 'mockRedirectUrl' },
      } as NodePaymentResponseInterface<any>;

      const topLocationService = TestBed.inject(TopLocationService);

      jest.spyOn(topLocationService, 'href', 'set').mockImplementation(jest.fn());
      jest.spyOn(nodeApiService, 'getShopUrls').mockReturnValue(of(mockShopUrls));
      jest.spyOn(service as any, 'preparePayment').mockReturnValue(of(undefined));
      jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(undefined));

      service.postPayment().subscribe(() => {
        expect(nodeApiService.getShopUrls).toHaveBeenCalledWith(service['flow']);
        expect(service['preparePayment']).toHaveBeenCalledWith(mockShopUrls);
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
      jest.spyOn(service as any, 'preparePayment').mockReturnValue(of(undefined));
      jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(undefined));

      service.postPayment().subscribe(
        jest.fn(),
        (error) => {
          expect(error).toEqual(new Error('The "redirectUrl" is empty in backend response'));
          done();
        }
      );
    });
  });

  describe('preparePayment', () => {
    it('should set payment details and call setPaymentDetails on NodeFlowService', async () => {
      const mockNodePaymentDetails = {
        frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/en/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
        frontendCancelUrl: 'https://cancelUrl.com',
        birthdate: 'mockBirthdate',
      };

      const localeConstantsService = TestBed.inject(LocaleConstantsService);
      const dateUtilService = TestBed.inject(DateUtilService);

      jest.spyOn(localeConstantsService, 'getLang').mockReturnValue('en');
      jest.spyOn(dateUtilService, 'fixDate').mockReturnValue('mockBirthdate');
      jest.spyOn(nodeFlowService, 'setPaymentDetails');

      await service['preparePayment'](mockShopUrls).toPromise();

      expect(service['env'].frontend.checkoutWrapper).toBeDefined();
      expect(service['nodeFlowService'].setPaymentDetails).toHaveBeenCalledWith(mockNodePaymentDetails);
    });

    it('should use default cancelUrl if shopUrls.cancelUrl is not provided', async () => {
      const mockNodePaymentDetails = {
        frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/en/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
        frontendCancelUrl: 'https://cancelUrl.com',
        birthdate: expect.anything(),
      };

      const localeConstantsService = TestBed.inject(LocaleConstantsService);

      jest.spyOn(localeConstantsService, 'getLang').mockReturnValue('en');
      jest.spyOn(nodeFlowService, 'setPaymentDetails');

      await service['preparePayment'](mockShopUrls).toPromise();

      expect(service['env'].frontend.checkoutWrapper).toBeDefined();
      expect(service['nodeFlowService'].setPaymentDetails).toHaveBeenCalledWith(mockNodePaymentDetails);
    });
  });
});
