import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PatchPaymentResponse, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { PaymentMethodEnum, PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';
import { fromMutationObserver, loadScript, LocaleConstantsService } from '@pe/checkout/utils';

import { IVY_BUTTON_SCRIPT } from '../../settings';
import { flowWithPaymentOptionsFixture, paymentResponseWithStatusFixture } from '../../test';

import { PaymentServiceV2 } from './payment-v2.service';

jest.mock('@pe/checkout/utils', () => ({
  ...jest.requireActual('@pe/checkout/utils'),
  loadScript: jest.fn(),
  fromMutationObserver: jest.fn(),
}));

describe('PaymentServiceV2', () => {

  let service: PaymentServiceV2;

  let store: Store;
  let nodeApiService: NodeApiService;
  let nodeFlowService: NodeFlowService;
  let localeConstantsService: LocaleConstantsService;

  const paymentResponse = paymentResponseWithStatusFixture(
    PaymentStatusEnum.STATUS_IN_PROCESS,
    PaymentSpecificStatusEnum.NEED_CUSTOMER_APPROVAL
  );

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentServiceV2,
        TopLocationService,
        NodeApiService,
        NodeFlowService,
        LocaleConstantsService,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.IVY]: {},
    }));
    store.dispatch(new PatchPaymentResponse(paymentResponse));
    nodeApiService = TestBed.inject(NodeApiService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    localeConstantsService = TestBed.inject(LocaleConstantsService);

    (global as any).startIvyCheckout = jest.fn();

    service = TestBed.inject(PaymentServiceV2);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should correctly prepare payment details', () => {

    const mockShopUrls: any = {
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
    // const getLangSpy = (getLang as Jes)
    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

    (service as any).preparePayment().toPromise();

    expect(getShopUrlsSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
    expect(getLangSpy).toHaveBeenCalled();
    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);

  });

  it('should correctly prepare payment details if cancelUrl is null', () => {

    const mockShopUrls: any = {
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
    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

    (service as any).preparePayment().toPromise();

    expect(getShopUrlsSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
    expect(getLangSpy).toHaveBeenCalled();
    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);

  });

  it('should initiate Ivy checkout in a popup on successful payment preparation', fakeAsync(() => {
    const preparePaymentSpy = jest.spyOn((service as any), 'preparePayment')
      .mockReturnValue(of(true));
    const loadScriptSpy = (loadScript as jest.Mock)
      .mockReturnValue(of(true));
    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(null));
    const fromMutationObserverSpy = (fromMutationObserver as jest.Mock)
      .mockReturnValue(of(true));

    service.postPayment().subscribe();

    tick();

    expect(preparePaymentSpy).toHaveBeenCalled();
    expect(loadScriptSpy).toHaveBeenCalledWith(IVY_BUTTON_SCRIPT, 'ivy-button-script');
    expect(postPaymentSpy).toHaveBeenCalled();
    expect((global as any).startIvyCheckout)
      .toHaveBeenCalledWith(paymentResponse.paymentDetails.redirectUrl, 'popup');
    expect(fromMutationObserverSpy).toHaveBeenCalledWith(document.body);

  }));
});
