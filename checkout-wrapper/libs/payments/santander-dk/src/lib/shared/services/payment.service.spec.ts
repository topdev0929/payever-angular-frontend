import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import { NodeShopUrlsInterface, PaymentMethodEnum, PaymentStatusEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus, localeFixture } from '../../test';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {

  let service: PaymentService;

  let store: Store;
  let nodeApiService: NodeApiService;
  let nodeFlowService: NodeFlowService;
  let localeConstantsService: LocaleConstantsService;

  let getLang: jest.SpyInstance;
  let assignPaymentDetails: jest.SpyInstance;
  let postPayment: jest.SpyInstance;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentService,
        NodeApiService,
        NodeFlowService,
        LocaleConstantsService,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        response: PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null),
      },
    }));
    nodeApiService = TestBed.inject(NodeApiService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    localeConstantsService = TestBed.inject(LocaleConstantsService);

    getLang = jest.spyOn(localeConstantsService, 'getLang')
      .mockReturnValue(localeFixture());
    assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails')
      .mockReturnValue(of(null));
    postPayment = jest.spyOn(nodeFlowService, 'postPayment')
      .mockReturnValue(of(null));

    service = TestBed.inject(PaymentService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should call assignPaymentDetails and postPayment', (done) => {

    const mockShopUrls: NodeShopUrlsInterface = {
      successUrl: 'success-url',
      failureUrl: 'failure-url',
      cancelUrl: 'cancel-url',
    };

    const getShopUrls = jest.spyOn(nodeApiService, 'getShopUrls')
      .mockReturnValue(of(mockShopUrls));

    service.postPayment().subscribe({
      next: () => {
        expect(getShopUrls).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
        expect(getLang).toHaveBeenCalled();
        expect(assignPaymentDetails).toHaveBeenCalledWith({
          frontendSuccessUrl: mockShopUrls.successUrl,
          frontendFailureUrl: mockShopUrls.failureUrl,
        });
        expect(postPayment).toHaveBeenCalled();
        done();
      },
      error: done.fail,
    });

  });

  it('should call assignPaymentDetails with default urls if getShopUrls return null', (done) => {

    const mockShopUrls: NodeShopUrlsInterface = {
      successUrl: null,
      failureUrl: null,
      cancelUrl: null,
    };

    const expectedUrls = {
      frontendSuccessUrl: `${peEnvFixture().frontend.checkoutWrapper}/${localeFixture()}/pay/${flowWithPaymentOptionsFixture().id}/static-finish/success`,
      frontendFailureUrl: `${peEnvFixture().frontend.checkoutWrapper}/${localeFixture()}/pay/${flowWithPaymentOptionsFixture().id}/static-finish/fail`,
    };

    const getShopUrls = jest.spyOn(nodeApiService, 'getShopUrls')
      .mockReturnValue(of(mockShopUrls));

    service.postPayment().subscribe({
      next: () => {
        expect(getShopUrls).toHaveBeenCalledWith(flowWithPaymentOptionsFixture());
        expect(getLang).toHaveBeenCalled();
        expect(assignPaymentDetails).toHaveBeenCalledWith(expectedUrls);
        expect(postPayment).toHaveBeenCalled();
        done();
      },
      error: done.fail,
    });

  });

});
