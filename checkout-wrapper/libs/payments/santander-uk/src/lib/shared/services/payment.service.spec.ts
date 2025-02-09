import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;

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
        NodeFlowService,
        ExternalRedirectStorage,
        LocaleConstantsService,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeFlowService = TestBed.inject(NodeFlowService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
    localeConstantsService = TestBed.inject(LocaleConstantsService);

    service = TestBed.inject(PaymentService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should assign correct url to assignPaymentDetails', () => {

    const mockLang = 'en';

    const getLangSpy = jest.spyOn(localeConstantsService, 'getLang')
      .mockReturnValue(mockLang);
    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
      .mockReturnValue(of(null));
    jest.spyOn(nodeFlowService, 'postPayment').mockReturnValue(of());

    const expectedUrl = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${mockLang}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
    };

    service.postPayment();

    expect(getLangSpy).toHaveBeenCalled();
    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedUrl);

  });

  it('should save data before redirect', (done) => {

    const mockPaymentResponse: any = {
      paymentDetails: {
        frontendFinishUrl: 'https://frontend-finish-url.com',
      },
    };
    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
      .mockReturnValue(of(null));
    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(mockPaymentResponse));
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));

    service.postPayment().subscribe({
      next: (data) => {
        expect(data).toEqual(mockPaymentResponse);
        expect(assignPaymentDetailsSpy).toHaveBeenCalled();
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());

        done();
      },
    });

  });

  it('should just return response without save data before redirect', (done) => {

    const mockPaymentResponse: any = {
      paymentDetails: {
        frontendFinishUrl: null,
      },
    };
    const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
      .mockReturnValue(of(null));
    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(mockPaymentResponse));
    const saveDataBeforeRedirectSpy = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
      .mockReturnValue(of(null));

    service.postPayment().subscribe({
      next: (data) => {
        expect(data).toEqual(mockPaymentResponse);
        expect(assignPaymentDetailsSpy).toHaveBeenCalled();
        expect(postPaymentSpy).toHaveBeenCalled();
        expect(saveDataBeforeRedirectSpy).not.toHaveBeenCalledWith();

        done();
      },
    });

  });

});
