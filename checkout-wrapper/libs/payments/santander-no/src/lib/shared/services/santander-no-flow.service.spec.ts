import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { GetApiCallData, PatchPaymentResponse, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, NodeShopUrlsInterface, PaymentSpecificStatusEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../test';
import { NodePaymentDetailsResponseInterface } from '../types';

import { RatesCalculationApiService } from './rates-calculation-api.service';
import { SantanderNoApiService } from './santander-no-api.service';
import { SantanderNoFlowService } from './santander-no-flow.service';

describe('SantanderNoFlowService', () => {
  let service: SantanderNoFlowService;
  let store: Store;

  const storeHelper = new StoreHelper();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationApiService,
        SantanderNoFlowService,
      ],
    });

    service = TestBed.inject(SantanderNoFlowService);
    store = TestBed.inject(Store);
    storeHelper.setMockData();
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('postMoreInfo', () => {
    it('should dispatch GetApiCallData action if apiCallId is present in the response', async () => {
      const response = {
        payment: { apiCallId: 'apiCallId' },
      } as NodePaymentResponseInterface<unknown>;

      const santanderNoApiService = TestBed.inject(SantanderNoApiService);
      jest.spyOn(santanderNoApiService, 'postMoreInfo').mockReturnValue(of(response));

      const store = TestBed.inject(Store);
      const dispatchSpy = jest.spyOn(store, 'dispatch').mockReturnValue(of(null));

      jest.spyOn(store, 'selectSnapshot').mockReturnValue('mockSnapshot');

      await service.postMoreInfo().toPromise();

      expect(dispatchSpy).toHaveBeenCalledWith(new GetApiCallData(response));
    });

    it('should dispatch PatchPaymentResponse action if apiCallId is not present in the response', async () => {
      const response = {
        payment: { apiCallId: null },
      } as NodePaymentResponseInterface<unknown>;

      const santanderNoApiService = TestBed.inject(SantanderNoApiService);
      jest.spyOn(santanderNoApiService, 'postMoreInfo').mockReturnValue(of(response));

      const store = TestBed.inject(Store);
      const dispatchSpy = jest.spyOn(store, 'dispatch').mockReturnValue(of(null));

      jest.spyOn(store, 'selectSnapshot').mockReturnValue('mockSnapshot');

      await service.postMoreInfo().toPromise();

      expect(dispatchSpy).toHaveBeenCalledWith(new PatchPaymentResponse(response));
    });

    it('should select snapshot from PaymentState.response after dispatching actions', () => {
      const response = {
        payment: { apiCallId: 'apiCallId' },
      } as NodePaymentResponseInterface<unknown>;

      const santanderNoApiService = TestBed.inject(SantanderNoApiService);
      jest.spyOn(santanderNoApiService, 'postMoreInfo').mockReturnValue(of(response));

      const store = TestBed.inject(Store);

      const selectSnapshotSpy = jest.spyOn(store, 'selectSnapshot').mockReturnValue('mockSnapshot');

      service.postMoreInfo().subscribe();

      expect(selectSnapshotSpy).toHaveBeenCalled();
    });
  });

  describe('isNeedMoreInfo', () => {
    it('should return true if specificStatus is NEED_MORE_INFO_SIFO', () => {
      const paymentResponse = {
        payment: { specificStatus: PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO },
      } as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

      const result = service.isNeedMoreInfo(paymentResponse);

      expect(result).toBe(true);
    });

    it('should return true if specificStatus is NEED_MORE_INFO_DTI', () => {
      const paymentResponse = {
        payment: { specificStatus: PaymentSpecificStatusEnum.NEED_MORE_INFO_DTI },
      } as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

      const result = service.isNeedMoreInfo(paymentResponse);

      expect(result).toBe(true);
    });

    it('should return true if specificStatus is NEED_MORE_INFO_IIR', () => {
      const paymentResponse = {
        payment: { specificStatus: PaymentSpecificStatusEnum.NEED_MORE_INFO_IIR },
      } as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

      const result = service.isNeedMoreInfo(paymentResponse);

      expect(result).toBe(true);
    });

    it('should return false if specificStatus is not in the list', () => {
      const paymentResponse = {
        payment: { specificStatus: 'OTHER_STATUS' as PaymentSpecificStatusEnum },
      } as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

      const result = service.isNeedMoreInfo(paymentResponse);

      expect(result).toBe(false);
    });

    it('should return false if paymentResponse or payment is null', () => {
      const paymentResponse = null as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

      const result = service.isNeedMoreInfo(paymentResponse);

      expect(result).toBe(false);
    });
  });

  describe('getShopUrls', () => {
    it('should call the necessary methods and update payment details', async () => {
      const nodeApiService = TestBed.inject(NodeApiService);
      const nodeApiServiceSpy = jest.spyOn(nodeApiService, 'getShopUrls')
        .mockReturnValue(of({} as NodeShopUrlsInterface));

      const nodeFlowService = TestBed.inject(NodeFlowService);
      const nodeFlowServiceSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

      const localeConstantsService = TestBed.inject(LocaleConstantsService);
      jest.spyOn(localeConstantsService, 'getLang').mockReturnValue('en');

      await service.getShopUrls().toPromise();

      expect(nodeApiServiceSpy).toHaveBeenCalledWith(service['flow']);
      expect(nodeFlowServiceSpy).toHaveBeenCalled();
    });

    it('should use provided shopUrls properties if available', async () => {
      const nodeApiService = TestBed.inject(NodeApiService);
      jest.spyOn(nodeApiService, 'getShopUrls').mockReturnValue(of({
        successUrl: '/custom/success',
        failureUrl: '/custom/fail',
        cancelUrl: '/custom/cancel',
      }));

      const nodeFlowService = TestBed.inject(NodeFlowService);
      const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

      const localeConstantsService = TestBed.inject(LocaleConstantsService);
      jest.spyOn(localeConstantsService, 'getLang').mockReturnValue('en');

      await service.getShopUrls().toPromise();

      expect(assignPaymentDetailsSpy).toHaveBeenCalledWith({
          frontendSuccessUrl: '/custom/success',
          frontendFailureUrl: '/custom/fail',
          frontendCancelUrl: '/custom/cancel',
      });
    });
  });
});
