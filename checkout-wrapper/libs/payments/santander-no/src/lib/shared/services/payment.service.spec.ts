import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PatchPaymentResponse, SetFlow, SetPaymentComplete } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentSpecificStatusEnum } from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';

import { flowWithPaymentOptionsFixture } from '../../test';
import { NodePaymentDetailsInterface } from '../types';

import { PaymentService } from './payment.service';
import { SantanderNoFlowService } from './santander-no-flow.service';

jest.mock('@pe/checkout/utils/prepare-data', () => ({
  ...jest.requireActual('@pe/checkout/utils/prepare-data'),
  prepareData: jest.fn(),
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let store: Store;
  let nodeFlowService: NodeFlowService;
  let santanderNoFlowService: SantanderNoFlowService;
  let topLocationService: TopLocationService;

  const storeHelper = new StoreHelper();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        PaymentService,
      ],
    });

    paymentService = TestBed.inject(PaymentService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    santanderNoFlowService = TestBed.inject(SantanderNoFlowService);
    topLocationService = TestBed.inject(TopLocationService);
    store = TestBed.inject(Store);
    storeHelper.setMockData();
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse({
      payment: {
        specificStatus: PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
      },
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('needMoreInfoScenario', () => {
    it('should return true when specificStatus requires more info', () => {
      expect(paymentService.needMoreInfoScenario).toBe(true);
    });

    it('should return false when specificStatus does not require more info', () => {
      jest.spyOn(paymentService as any, 'paymentResponse', 'get').mockReturnValue({
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_APPROVED,
        },
      });

      expect(paymentService.needMoreInfoScenario).toBe(false);
    });
  });

  describe('preparePayment', () => {
    it('should call nodeFlowService.assignPaymentDetails with correct data', () => {
      const formData = {
        employmentPercent: 1.24,
        numberOfChildren: 2,
      } as any;
      const expectedNodePaymentDetails = {
        mortgageLoans: [],
        securedLoans: [],
        studentLoans: [],
        employmentPercent: 1.24,
        numberOfChildren: 2,
      } as NodePaymentDetailsInterface;
      (prepareData as jest.Mock).mockReturnValue(formData);

      const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

      paymentService['preparePayment'](formData);
      expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);
    });

    it('should correct parse', () => {
      const formData: any = {
        mortgageLoans: [],
        securedLoans: [],
        studentLoans: [],
        employmentPercent: '1.24',
        numberOfChildren: '2.12',
      };
      (prepareData as jest.Mock).mockReturnValue(formData);

      const expectedNodePaymentDetails = {
        ...formData,
        employmentPercent: 1.24,
        numberOfChildren: 2,
      };

      const assignPaymentDetailsSpy = jest.spyOn(nodeFlowService, 'assignPaymentDetails');

      paymentService['preparePayment'](formData);
      expect(assignPaymentDetailsSpy).toHaveBeenCalledWith(expectedNodePaymentDetails);
    });
  });

  describe('postPayment', () => {
    it('should return an observable with null if needMoreInfoScenario is false', (done) => {
      jest.spyOn(paymentService, 'needMoreInfoScenario', 'get').mockReturnValue(false);

      paymentService.postPayment().subscribe((result) => {
        expect(result).toEqual(null);
        done();
      });
    });

    it('should set topLocationService.href when specificStatus is STATUS_APPROVED', (done) => {
      jest.spyOn(paymentService as any, 'paymentResponse', 'get').mockReturnValue({
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_APPROVED,
        },
        paymentDetails: {
          applicantSignReferenceUrl: 'http://localhost/',
        },
      });

      const formDataMock = {};

      jest.spyOn(store, 'selectSnapshot').mockReturnValue(formDataMock);

      paymentService.postPayment().subscribe(() => {
        expect(topLocationService.href).toBe('http://localhost/');
        done();
      });
    });

    it('should handle isNeedApproval true', (done) => {
      const response: any = {
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_APPROVED,
        },
        paymentDetails: {
          applicantSignReferenceUrl: 'http://localhost/',
        },
      };
      jest.spyOn(paymentService as any, 'preparePayment').mockReturnValue(of(null));
      jest.spyOn(paymentService['santanderNoFlowService'], 'getShopUrls').mockReturnValue(of(null));
      jest.spyOn(paymentService['santanderNoFlowService'], 'postMoreInfo').mockReturnValue(of(response));
      jest.spyOn(paymentService['santanderNoFlowService'], 'isNeedApproval').mockReturnValue(true);
      jest.spyOn(paymentService as any, 'paymentResponse', 'get').mockReturnValue(response);
      jest.spyOn(paymentService as any, 'needMoreInfoScenario', 'get').mockReturnValue(true);

      const formDataMock = {};

      jest.spyOn(store, 'selectSnapshot').mockReturnValue(formDataMock);
      const dispatch = jest.spyOn(store, 'dispatch')
        .mockReturnValue(null);

      paymentService.postPayment().subscribe(() => {
        expect(paymentService['topLocationService'].isRedirecting).toBeTruthy();
        expect(paymentService['sectionStorageService'].isPassedPaymentData).toBeFalsy();
        expect(dispatch).toHaveBeenCalledWith([
          new SetPaymentComplete(false),
        ]);

        done();
      });
    });

    it('should call santanderNoFlowService methods in the correct order', async () => {
      jest.spyOn(paymentService as any, 'paymentResponse', 'get').mockReturnValue({
        payment: {
          specificStatus: PaymentSpecificStatusEnum.NEED_MORE_INFO_DTI,
        },
      });

      const formDataMock = {};
      jest.spyOn(store, 'selectSnapshot').mockReturnValue(formDataMock);
      jest.spyOn(paymentService as any, 'preparePayment').mockReturnValue(of(null));
      jest.spyOn(nodeFlowService, 'assignPaymentDetails').mockReturnValue(of(null));
      jest.spyOn(topLocationService, 'href', 'set').mockReturnValue(null);
      const getShopUrlsSpy = jest.spyOn(santanderNoFlowService, 'getShopUrls').mockReturnValue(of({
        cancelUrl: 'https://cancelUrl.com',
        failureUrl: 'https://failureUrl.com',
        successUrl: 'https://successUrl.com',
      }));
      const postMoreInfoSpy = jest.spyOn(santanderNoFlowService, 'postMoreInfo').mockReturnValue(of({
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_APPROVED,
        },
        paymentDetails: {
          applicantSignReferenceUrl: 'https://applicantSignReferenceUrl.com',
        },
      } as NodePaymentResponseInterface<unknown>));

      await paymentService.postPayment().toPromise();

      expect(getShopUrlsSpy).toHaveBeenCalled();
      expect(postMoreInfoSpy).toHaveBeenCalled();
    });
  });
});
