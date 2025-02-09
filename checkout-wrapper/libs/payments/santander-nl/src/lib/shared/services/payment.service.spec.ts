import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { SharedModule } from '../shared.module';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;
  let topLocationService: TopLocationService;
  let store: Store;
  let nodeApiService: NodeApiService;
  let nodeFlowService: NodeFlowService;
  let localeConstantsService: LocaleConstantsService;
  let externalRedirectStorage: ExternalRedirectStorage;

  const mockFlow = { id: 'flow-id' };
  const mockLang = 'en';
  const mockDefaultShopUrls: any = {
    failureUrl: null,
  };
  const mockDefaultPaymentResponse: any = {
    paymentDetails: {
      redirectUrl: 'https://payever.redirect-url.com',
    },
  };

  let getLangSpy: jest.SpyInstance;
  let assignPaymentDetailsSpy: jest.SpyInstance;
  let getShopUrlsSpy: jest.SpyInstance;
  let postPaymentSpy: jest.SpyInstance;
  let saveDataBeforeRedirectSpy: jest.SpyInstance;
  let setHrefSpy: jest.SpyInstance;

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
        importProvidersFrom(SharedModule),
      ],
    });

    store = TestBed.inject(Store);
    nodeApiService = TestBed.inject(NodeApiService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    localeConstantsService = TestBed.inject(LocaleConstantsService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);

    service = TestBed.inject(PaymentService);
    topLocationService = TestBed.inject(TopLocationService);

    jest.spyOn(store, 'selectSnapshot').mockReturnValue(mockFlow);
    getLangSpy = jest.spyOn(localeConstantsService, 'getLang').mockReturnValue(mockLang);
    assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
    getShopUrlsSpy = jest.spyOn(nodeApiService, 'getShopUrls');
    postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment');
    saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect');
    setHrefSpy = jest.spyOn(topLocationService, 'href', 'set');

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should send correct urls to assignPaymentDetails with defined failureUrl', (done) => {

    const mockShopUrls: any = {
      failureUrl: 'https://failure-url.com',
    };
    const expectedUrls: any = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${mockLang}/pay/${mockFlow.id}/redirect-to-payment`,
      frontendFailureUrl: mockShopUrls.failureUrl,
    };

    getShopUrlsSpy.mockReturnValue(of(mockShopUrls));
    assignPaymentDetailsSpy.mockReturnValue(of(null));
    postPaymentSpy.mockReturnValue(of({ paymentDetails: { redirectUrl: 'test' } }) as any);
    saveDataBeforeRedirectSpy.mockReturnValue(of(null));

    service.postPayment().subscribe({
      next: () => {
        expect(getShopUrlsSpy).toHaveBeenCalledWith(mockFlow);
        expect(getLangSpy).toHaveBeenCalled();
        expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedUrls);

        done();
      },
    });

  });

  it('should send correct urls to assignPaymentDetails if failureUrl is undefined', (done) => {

    const expectedUrls: any = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${mockLang}/pay/${mockFlow.id}/redirect-to-payment`,
      frontendFailureUrl: `${peEnvFixture().frontend.checkoutWrapper}/${mockLang}/pay/${mockFlow.id}/redirect-to-choose-payment`,
    };

    getShopUrlsSpy.mockReturnValue(of(mockDefaultShopUrls));
    assignPaymentDetailsSpy.mockReturnValue(of(null));
    postPaymentSpy.mockReturnValue(of(mockDefaultPaymentResponse));
    saveDataBeforeRedirectSpy.mockReturnValue(of(null));

    service.postPayment().subscribe({
      next: () => {
        expect(getShopUrlsSpy).toHaveBeenCalledWith(mockFlow);
        expect(getLangSpy).toHaveBeenCalled();
        expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedUrls);

        done();
      },
    });

  });

  it('should successfully post payment', (done) => {

    getShopUrlsSpy.mockReturnValue(of(mockDefaultShopUrls));
    assignPaymentDetailsSpy.mockReturnValue(of(null));
    postPaymentSpy.mockReturnValue(of(mockDefaultPaymentResponse));
    saveDataBeforeRedirectSpy.mockReturnValue(of(null));

    service.postPayment().subscribe({
      next: () => {
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(mockFlow);
        expect(setHrefSpy).toHaveBeenCalledWith(mockDefaultPaymentResponse.paymentDetails.redirectUrl);

        done();
      },
    });

  });

  it('should handle error during post payment process', (done) => {

    getShopUrlsSpy.mockReturnValue(of(mockDefaultShopUrls));
    assignPaymentDetailsSpy.mockReturnValue(of(null));
    postPaymentSpy.mockReturnValue(of(null));
    saveDataBeforeRedirectSpy.mockReturnValue(of(null));

    service.postPayment().subscribe({
      error: (err) => {
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).not.toHaveBeenCalledWith(mockFlow);
        expect(setHrefSpy).not.toHaveBeenCalledWith();
        expect(err.message).toEqual('The "redirectUrl" is empty in backend response');

        done();
      },
    });

  });

});
