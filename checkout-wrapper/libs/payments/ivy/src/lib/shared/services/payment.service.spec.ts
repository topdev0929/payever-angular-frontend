import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { NodeShopUrlsInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;
  let topLocationService: TopLocationService;

  let store: Store;
  let nodeApiService: NodeApiService;
  let nodeFlowService: NodeFlowService;
  let localeConstantsService: LocaleConstantsService;
  let externalRedirectStorage: ExternalRedirectStorage;

  Object.defineProperty(window, 'location', {
    value: {
      href: null,
    },
    writable: true,
  });

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentService,
        TopLocationService,
        NodeApiService,
        NodeFlowService,
        LocaleConstantsService,
        ExternalRedirectStorage,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeApiService = TestBed.inject(NodeApiService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    localeConstantsService = TestBed.inject(LocaleConstantsService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);

    service = TestBed.inject(PaymentService);
    topLocationService = TestBed.inject(TopLocationService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should successfully prepare payment details', () => {

    const mockShopUrls: NodeShopUrlsInterface = {
      successUrl: 'https://payever-success-url.com',
      failureUrl: 'https://payever-failure-url.com',
      cancelUrl: 'https://payever-cancel-url.com',
    };

    const mockLang = 'en';

    const expectedNodePaymentDetails = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${mockLang}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
      frontendCancelUrl: mockShopUrls.cancelUrl,
    };

    const getShopUrlsSpy = jest.spyOn(nodeApiService, 'getShopUrls')
      .mockReturnValue(of(mockShopUrls));
    const getLangSpy = jest.spyOn(localeConstantsService, 'getLang')
      .mockReturnValue(mockLang);
    const setPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'setPaymentDetails');

    (service as any).preparePayment().toPromise();

    expect(getShopUrlsSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
    expect(getLangSpy).toHaveBeenCalled();
    expect(setPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);

  });

  it('should successfully prepare payment details if cancelUrl null', () => {

    const mockShopUrls: NodeShopUrlsInterface = {
      successUrl: 'https://payever-success-url.com',
      failureUrl: 'https://payever-failure-url.com',
      cancelUrl: null,
    };

    const mockLang = 'en';

    const expectedNodePaymentDetails = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${mockLang}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
      frontendCancelUrl: `${peEnvFixture().frontend.checkoutWrapper}/${mockLang}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-choose-payment`,
    };

    const getShopUrlsSpy = jest.spyOn(nodeApiService, 'getShopUrls')
      .mockReturnValue(of(mockShopUrls));
    const getLangSpy = jest.spyOn(localeConstantsService, 'getLang')
      .mockReturnValue(mockLang);
    const setPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'setPaymentDetails');

    (service as any).preparePayment().toPromise();

    expect(getShopUrlsSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
    expect(getLangSpy).toHaveBeenCalled();
    expect(setPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);

  });

  it('should successfully post payment', (done) => {

    const mockPaymentResponse: any = {
      paymentDetails: {
        applicationNumber: 'application-number',
        redirectUrl: 'https://payever.redirect-url.com',
        frontendCancelUrl: 'https://payever.frontend-cancel-url.com',
        frontendFinishUrl: 'https://payever.frontend-finish-url.com',
        getPaymentStatusUrl: 'https://payever.get-payment-status-url.com',
      },
    };

    const preparePaymentSpy = jest.spyOn((service as any), 'preparePayment')
      .mockReturnValue(of(null));
    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(mockPaymentResponse));
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));
    const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set');


    service.postPayment().subscribe({
      next: () => {
        expect(preparePaymentSpy).toHaveBeenCalled();
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
        expect(setHrefSpy).toHaveBeenCalledWith(mockPaymentResponse.paymentDetails.redirectUrl);

        done();
      },
    });

  });

  it('should handle error during post payment process', (done) => {

    const preparePaymentSpy = jest.spyOn((service as any), 'preparePayment')
      .mockReturnValue(of(null));
    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(null));
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect');
    const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set');

    service.postPayment().subscribe({
      error: (err) => {
        expect(preparePaymentSpy).toHaveBeenCalled();
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).not.toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
        expect(setHrefSpy).not.toHaveBeenCalledWith();
        expect(err.message).toEqual('The "redirectUrl" is empty in backend response');

        done();
      },
    });

  });

});
