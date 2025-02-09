

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { FlowState, PatchFlow, PatchPaymentResponse, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import { PaymentApiCallInterface, PaymentStatusEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';


import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { PaymentDetails } from '../models';

import { OpenbankUtilsService } from './openbank-utils.service';
import { ZiniaPaymentService } from './payment-v2.service';

describe('ZiniaPaymentService', () => {
  let store: Store;

  let instance: ZiniaPaymentService;
  let nodeFlowService: NodeFlowService;
  let nodeApiService: NodeApiService;
  let env: EnvironmentConfigInterface;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ZiniaPaymentService,
        NodeFlowService,
        TopLocationService,
        MockProvider(NodeApiService),
      ],
    });
    instance = TestBed.inject(ZiniaPaymentService);
    env = TestBed.inject(PE_ENV);
    nodeFlowService = TestBed.inject(NodeFlowService);
    nodeApiService = TestBed.inject(NodeApiService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    jest.spyOn(TestBed.inject(ApiService), '_patchFlow')
      .mockImplementation((_, data) => of(data));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    describe('redirect', () => {
      const expectRedirect = (status: PaymentStatusEnum, expectRedirect: keyof PaymentApiCallInterface) => {
        it(`Should redirect to ${expectRedirect} with ${status}`, () => {
          const href = jest.spyOn(TopLocationService.prototype, 'href', 'set')
            .mockImplementation(jest.fn);
          const res = PaymentResponseWithStatus(status, null);
          const apiCall: PaymentApiCallInterface = {
            successUrl: 'success-url',
            cancelUrl: 'cancel-url',
            pendingUrl: 'pending-url',
          };
          store.dispatch(new PatchPaymentResponse(res));

          store.dispatch(new PatchFlow({ apiCall }));
          instance.redirect();
          expect(href).toHaveBeenCalledWith(apiCall[expectRedirect]);
        });
      };
      expectRedirect(PaymentStatusEnum.STATUS_ACCEPTED, 'successUrl');
      expectRedirect(PaymentStatusEnum.STATUS_FAILED, 'cancelUrl');
      expectRedirect(PaymentStatusEnum.STATUS_IN_PROCESS, 'pendingUrl');
    });
    it('postPayment', (done) => {
      const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
      const localeConstantsService = TestBed.inject(LocaleConstantsService);
      const flow = store.selectSnapshot(FlowState.flow);
      const threatMetrixService = TestBed.inject(ThreatMetrixService);
      const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);
      const openbankUtilsService = TestBed.inject(OpenbankUtilsService);
      const nodeResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        null,
      );
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(nodeResponse));
      const getShopUrls = jest.spyOn(nodeApiService, 'getShopUrls')
        .mockReturnValue(of({
          id: 'id',
          successUrl: null,
          failureUrl: null,
          cancelUrl: null,
        }));

      instance.postPayment().subscribe((response) => {
        const lang = localeConstantsService.getLang();
        const checkoutWrapper: string = env.frontend.checkoutWrapper;
        const riskSessionId = threatMetrixService.getLastRiskId(flow.id, paymentMethod);
        const successUrl = `${checkoutWrapper}/${lang}/pay/${flow.id}/redirect-to-payment`;
        const cancelUrl = `${checkoutWrapper}/${lang}/pay/${flow.id}/redirect-to-choose-payment`;

        const nodePaymentDetails: Partial<PaymentDetails> = {
          frontendSuccessUrl: successUrl,
          frontendFinishUrl: successUrl,
          frontendFailureUrl: cancelUrl,
          frontendCancelUrl: cancelUrl,
          forceRedirect: false,
          isPhoneValidated: true,
          ...(riskSessionId && { riskSessionId }),
          deviceInfo: openbankUtilsService.getDeviceInfo(),
          browserInfo: openbankUtilsService.getBrowserInfo(),
        };
        expect(response).toEqual(nodeResponse);
        expect(postPayment).toHaveBeenCalled();
        expect(assignPaymentDetails).toHaveBeenCalledWith(nodePaymentDetails);
        done();
      });
      expect(getShopUrls).toHaveBeenCalled();
    });
  });
});

