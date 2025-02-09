import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;
  let topLocationService: TopLocationService;

  let store: Store;
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
        NodeFlowService,
        LocaleConstantsService,
        ExternalRedirectStorage,
      ],
    }).compileComponents();

    nodeFlowService = TestBed.inject(NodeFlowService);
    localeConstantsService = TestBed.inject(LocaleConstantsService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(PaymentService);
    topLocationService = TestBed.inject(TopLocationService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should correctly prepare payment details', () => {

    const expectedLang = 'en';

    const expectedNodePaymentDetails = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${expectedLang}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
      frontendCancelUrl: `${peEnvFixture().frontend.checkoutWrapper}/${expectedLang}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-choose-payment`,
    };

    const getLangSpy = jest.spyOn(localeConstantsService, 'getLang')
      .mockReturnValue(expectedLang);
    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

    service['preparePayment']();

    expect(getLangSpy).toHaveBeenCalled();
    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);

  });

  it('should postPayment finish successfully', (done) => {

    const mockPaymentResponse: any = {
      paymentDetails: {
        token: 'token',
        redirectUrl: 'https://payever.redirect-url.com',
        frontendFinishUrl: 'https://payever.frontend-finish-url.com',
        frontendCancelUrl: 'https://payever.frontend-cancel-url.com',
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

  it('should postPayment handle error when redirectUrl is not defined', (done) => {

    const preparePaymentSpy = jest.spyOn((service as any), 'preparePayment')
      .mockReturnValue(of(null));
    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(null));
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));
    const setHrefSpy = jest.spyOn(topLocationService, 'href', 'set');


    service.postPayment().subscribe({
      error: (error) => {
        expect(preparePaymentSpy).toHaveBeenCalled();
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(error.message).toEqual('The "redirectUrl" is empty in backend response');
        expect(saveDataBeforeRedirectSpy).not.toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
        expect(setHrefSpy).not.toHaveBeenCalled();

        done();
      },
    });

  });

});
