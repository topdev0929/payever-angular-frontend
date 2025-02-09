import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture, localeFixture } from '../../test';
import { NodeAdditionalPaymentDetailsInterface } from '../types';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;

  let store: Store;
  let nodeFlowService: NodeFlowService;
  let localeConstantsService: LocaleConstantsService;

  let getLangSpy: jest.SpyInstance;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        LocaleConstantsService,
        PaymentService,
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeFlowService = TestBed.inject(NodeFlowService);
    localeConstantsService = TestBed.inject(LocaleConstantsService);

    getLangSpy = jest.spyOn(localeConstantsService, 'getLang')
      .mockReturnValue(localeFixture());
    jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(null);

    service = TestBed.inject(PaymentService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should send correct urls to assignPaymentDetails', () => {

    const assignPaymentDetailsSpy = jest.spyOn(service['nodeFlowService'], 'assignPaymentDetails');
    const expectedUrls: NodeAdditionalPaymentDetailsInterface = {
      frontendFinishUrl: `${peEnvFixture().frontend.checkoutWrapper}/${localeFixture()}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-payment`,
      frontendCancelUrl: `${peEnvFixture().frontend.checkoutWrapper}/${localeFixture()}/pay/${flowWithPaymentOptionsFixture().id}/redirect-to-choose-payment`,
    };

    service.postPayment();

    expect(getLangSpy).toHaveBeenCalled();
    expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedUrls);

  });

  it('should call nodeFlowService postPayment after call postPayment', () => {

    const postPaymentSpy = jest.spyOn(nodeFlowService, 'postPayment');

    service.postPayment();

    expect(postPaymentSpy).toHaveBeenCalled();

  });

});
