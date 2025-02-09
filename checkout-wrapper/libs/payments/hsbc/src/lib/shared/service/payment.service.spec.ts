import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils/src';

import { flowWithPaymentOptionsFixture, localeFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let store: Store;
  let nodeFlowService: NodeFlowService;

  const lang = localeFixture();
  const guestToken = 'accessToken';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        PaymentService,
        {
          provide: LocaleConstantsService,
          useValue: {
            getLang: jest.fn().mockReturnValue(lang),
          },
        },
      ],
    });
    service = TestBed.inject(PaymentService);

    store = TestBed.inject(Store);
    nodeFlowService = TestBed.inject(NodeFlowService);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('preparePayment', () => {
    const checkoutWrapper = peEnvFixture().frontend.checkoutWrapper;
    const flowId = flowWithPaymentOptionsFixture().id;
    let assignPaymentDetailsSpy: jest.SpyInstance;

    beforeEach(() => {
      assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
    });

    it('should correctly prepare payment details', () => {
      window = Object.create(window);
      Object.defineProperty(window, 'origin', {
        value: checkoutWrapper,
        writable: true,
      });

      const expectedNodePaymentDetails = {
        frontendFinishUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-payment`,
        frontendCancelUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-choose-payment`,
      };

      service['preparePayment']();

      expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);
    });

    it('should add guest token if origin not equal checkout wrapper url', () => {
      window = Object.create(window);
      Object.defineProperty(window, 'origin', {
        value: 'commerceos',
        writable: true,
      });
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(guestToken);

      const expectedNodePaymentDetails = {
        frontendFinishUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-payment?guest_token=${guestToken}`,
        frontendCancelUrl: `${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-choose-payment?guest_token=${guestToken}`,
      };

      service['preparePayment']();

      expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);
    });
  });

  describe('postPayment', () => {
    let preparePayment: jest.SpyInstance;
    let postPayment: jest.SpyInstance;
    let saveDataBeforeRedirect: jest.SpyInstance;
    let setHref: jest.SpyInstance;

    beforeEach(() => {
      preparePayment = jest.spyOn((service as any), 'preparePayment')
        .mockReturnValue(of(null));
      postPayment = jest.spyOn(nodeFlowService, 'postPayment');
      saveDataBeforeRedirect = jest.spyOn(service['externalRedirectStorage'], 'saveDataBeforeRedirect')
        .mockReturnValue(of(null));
      setHref = jest.spyOn(service['topLocationService'], 'href', 'set')
        .mockReturnValue(null);
    });

    it('should postPayment finish successfully', (done) => {
      const mockPaymentResponse: any = {
        paymentDetails: {
          redirectUrl: 'https://payever.redirect-url.com',
        },
      };
      postPayment.mockReturnValue(of(mockPaymentResponse));

      service.postPayment().subscribe({
        next: () => {
          expect(preparePayment).toHaveBeenCalled();
          expect(postPayment).toHaveBeenCalled();
          expect(saveDataBeforeRedirect).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
          expect(setHref).toHaveBeenCalledWith(mockPaymentResponse.paymentDetails.redirectUrl);

          done();
        },
      });
    });

    it('should postPayment handle error when redirectUrl is not defined', (done) => {
      postPayment.mockReturnValue(of(null));

      service.postPayment().subscribe({
        error: (error) => {
          expect(preparePayment).toHaveBeenCalled();
          expect(postPayment).toHaveBeenCalled();
          expect(error.message).toEqual('The "redirectUrl" is empty in backend response');
          expect(saveDataBeforeRedirect).not.toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
          expect(setHref).not.toHaveBeenCalled();

          done();
        },
      });
    });
  });
});
