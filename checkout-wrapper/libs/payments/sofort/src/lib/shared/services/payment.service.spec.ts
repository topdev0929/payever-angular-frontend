import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture, localeFixture } from '../../test';

import { PaymentService } from './payment.service';

Object.defineProperty(window, 'location', {
  value: {
    href: null,
  },
  writable: true,
});

describe('PaymentService', () => {

  let service: PaymentService;
  let topLocationService: TopLocationService;

  let store: Store;
  let nodeFlowService: NodeFlowService;
  let externalRedirectStorage: ExternalRedirectStorage;
  let localeConstantsService: LocaleConstantsService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentService,
        TopLocationService,
        NodeFlowService,
        ExternalRedirectStorage,
        LocaleConstantsService,
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    nodeFlowService = TestBed.inject(NodeFlowService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
    localeConstantsService = TestBed.inject(LocaleConstantsService);
    jest.spyOn(localeConstantsService, 'getLang')
      .mockReturnValue(localeFixture());

    service = TestBed.inject(PaymentService);
    topLocationService = TestBed.inject(TopLocationService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should assign correct urls to assignPaymentDetails', () => {

    const getLangSpy = jest.spyOn(localeConstantsService, 'getLang');
    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
    jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of());

    const expectedUrls = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${localeFixture()}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
      frontendCancelUrl: `${peEnvFixture().frontend.checkoutWrapper}/${localeFixture()}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-choose-payment`,
    };

    service.postPayment();

    expect(getLangSpy).toHaveBeenCalled();
    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedUrls);

  });

  it('should save data and redirect', (done) => {

    const mockPaymentResponse: any = {
      paymentDetails: {
        redirectUrl: 'https://redirect-url.com',
      },
    };

    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(mockPaymentResponse));
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));
    const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set');

    service.postPayment().subscribe({
      next: (data) => {
        expect(data).toEqual(mockPaymentResponse);
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
        expect(setHrefSpy).toHaveBeenCalledWith(mockPaymentResponse.paymentDetails.redirectUrl);

        done();
      },
    });

  });

  it('should handle empty redirectUrl error', (done) => {

    const mockPaymentResponse: any = {
      paymentDetails: {
        redirectUrl: null,
      },
    };

    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(mockPaymentResponse));
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));
    const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set');

    service.postPayment().subscribe({
      error: (err) => {
        expect(err.message).toEqual('The "redirectUrl" is empty in backend response');
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).not.toHaveBeenCalled();
        expect(setHrefSpy).not.toHaveBeenCalled();

        done();
      },
    });

  });

});
