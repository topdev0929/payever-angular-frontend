import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { cold } from 'jest-marbles';
import { of, throwError } from 'rxjs';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PatchParams, PatchPaymentDetails, PatchPaymentResponse, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  FinishProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import {
  FlowStateEnum,
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  PollingError,
  ResponseErrorsInterface,
} from '@pe/checkout/types';

import { AdditionalStepsModule } from '../../../additional-steps';
import { SIGNING_LINK_POLLING_INTERVAL, SIGNING_LINK_POLLING_TIMEOUT } from '../../../settings';
import { FinishComponent, FinishStyleComponent } from '../../../shared/components';
import { ApplicationFlowTypeEnum } from '../../../shared/constants';
import { PaymentService, SantanderDeFlowService } from '../../../shared/services';
import { SharedModule } from '../../../shared/shared.module';
import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

enum UpdatePaymentModeEnum {
  WaitingForSigningURL,
  ProcessingSigning
}

describe('FinishContainerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;
  let store: Store;
  let analyticsFormService: AnalyticsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
        SharedModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
        { provide: PaymentInquiryStorage, useValue: {} },
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishComponent,
        FinishStyleComponent,
        FinishContainerComponent,
      ],
    }).compileComponents();

    createComponent();
  });

  const createComponent = (flow = flowWithPaymentOptionsFixture()) => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flow));

    analyticsFormService = TestBed.inject(AnalyticsFormService);
    store.dispatch(new PatchPaymentDetails({
      applicationFlowType: ApplicationFlowTypeEnum.TwoApplicants,
    }));

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    jest.useFakeTimers();


    fixture.detectChanges();
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();
  });

  describe('ngOnInit', () => {
    it('should poll updatePayment on redirect', () => {
      expect(component).toBeDefined();
      createComponent({
        ...flowWithPaymentOptionsFixture(),
        state: FlowStateEnum.FINISH,
      });
      store.dispatch(new PatchParams({ processed: true }));
      store.dispatch(new PatchPaymentResponse({
        payment: {
          status: PaymentStatusEnum.STATUS_IN_PROCESS,
          specificStatus: PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
        },
      }));


      const runUpdatePayment = jest.spyOn(SantanderDeFlowService.prototype, 'runUpdatePaymentWithTimeout')
        .mockReturnValue(cold('----p--l', {
          p: {
            isProcessingSigning: true,
            isCheckStatusProcessing: true,
            isWaitingForSignUrl: false,
            isUpdatePaymentTimeout: false,
          },
          l: {
            isProcessingSigning: false,
            isCheckStatusProcessing: false,
            isWaitingForSignUrl: false,
            isUpdatePaymentTimeout: false,
          },
        }));


      component.ngOnInit();
      expect(runUpdatePayment).toBeCalledWith(UpdatePaymentModeEnum.ProcessingSigning,
        {
          pollingInterval: SIGNING_LINK_POLLING_INTERVAL,
          maxTimeout: SIGNING_LINK_POLLING_TIMEOUT,
        });

      fixture.detectChanges();
      expect(component.isProcessingSigning).toBe(true);
      expect(component.isCheckStatusProcessing).toBe(true);
      expect(component.isUpdatePaymentTimeout).toBe(false);
    });

    it('should call showFinishModalFromExistingPayment and initPaymentMethod', () => {
      const initPaymentMethodSpy = jest.spyOn(analyticsFormService, 'initPaymentMethod');

      component.ngOnInit();

      expect(initPaymentMethodSpy).toHaveBeenCalledWith(component.paymentMethod);
    });

    it('should handel errors', () => {
      jest.spyOn(analyticsFormService, 'initPaymentMethod')
        .mockReturnValue(null);
      jest.spyOn(FinishContainerComponent.prototype as any, 'needToProcessingSigning')
        .mockReturnValue(true);

      store.dispatch(new PatchParams({ processed: true }));
      store.dispatch(new PatchPaymentResponse({
        payment: {
          status: PaymentStatusEnum.STATUS_IN_PROCESS,
          specificStatus: PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
        },
      }));

      const responseMock: ResponseErrorsInterface = {
        code: 400,
        errors: null,
        message: 'error message',
        raw: {
          error: 'error',
        } as HttpErrorResponse,
      };

      const runUpdatePayment = jest.spyOn(component as any, 'runUpdatePaymentWithTimeout')
      .mockReturnValue(throwError(responseMock));

      component.ngOnInit();

      expect(runUpdatePayment).toBeCalled();
      expect(component.errors).toEqual(responseMock.errors);
      expect(component.errorMessage).toEqual('error message');
    });

  });

  describe('isPaymentComplete', () => {
    beforeEach(() => {
      jest.spyOn(component, 'flow', 'get').mockReturnValue({
        ...flowWithPaymentOptionsFixture(),
        state: FlowStateEnum.FINISH,
      });
    });

    it('should isPaymentComplete return true if status not equal STATUS_IN_PROCESS', () => {
      const finalResponse = PaymentResponseWithStatus(null, null);
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(finalResponse);
      expect(component['isPaymentComplete']).toBeTruthy();
    });

    it('should isPaymentComplete return true if ss equal STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED', () => {
      const finalResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        PaymentSpecificStatusEnum.STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED,
      );
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(finalResponse);
      expect(component['isPaymentComplete']).toBeTruthy();
    });

    it('should isPaymentComplete return false', () => {
      const finalResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        null,
      );
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
        .mockReturnValue(finalResponse);
      expect(component['isPaymentComplete']).toBeFalsy();
    });
  });


  describe('processErrors', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    it('should process errors', (done) => {
      const responseMock: ResponseErrorsInterface = {
        code: 400,
        errors: null,
        message: 'error message',
        raw: {
          error: 'error',
        } as HttpErrorResponse,
      };

      const cdrSpy = jest.spyOn(component['cdr'], 'detectChanges');
      const processErrorsSpy = jest.spyOn(component as any, 'processErrors');

      jest.spyOn(component as any, 'runUpdatePaymentWithTimeout')
        .mockReturnValue(throwError(responseMock));

      component['paymentCallback']().subscribe(jest.fn(), () => {
        expect(processErrorsSpy).toHaveBeenCalledWith(responseMock);
        expect(component.errors).toEqual(responseMock.errors);
        expect(component.isWaitingForSignUrl).toEqual(false);
        expect(component.isUpdatePaymentTimeout).toEqual(false);
        expect(component.errorMessage).toEqual('error message');
        expect(cdrSpy).toHaveBeenCalled();

        done();
      });
      jest.advanceTimersByTime(5000);
    });

    it('should process errors with errorTexts', (done) => {
      const responseMock: ResponseErrorsInterface = {
        code: 400,
        errors: {
          test: 'some test error',
          test2: 'some test error 2',
        },
        message: 'error message',
        raw: {
          error: 'error',
        } as HttpErrorResponse,
      };

      const cdrSpy = jest.spyOn(component['cdr'], 'detectChanges');
      const processErrorsSpy = jest.spyOn(component as any, 'processErrors');

      jest.spyOn(component as any, 'runUpdatePaymentWithTimeout')
        .mockReturnValue(throwError(responseMock));

      component['paymentCallback']().subscribe(jest.fn(), () => {
        expect(processErrorsSpy).toHaveBeenCalledWith(responseMock);
        expect(component.errors).toEqual(responseMock.errors);
        expect(component.isWaitingForSignUrl).toEqual(false);
        expect(component.isUpdatePaymentTimeout).toEqual(false);
        expect(component.errorMessage).toEqual(Object.values(responseMock.errors).join(', '));
        expect(cdrSpy).toHaveBeenCalled();

        done();
      });
      jest.advanceTimersByTime(5000);
    });
  });


  describe('runUpdatePaymentWithTimeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should run update payment with a successful response', (done) => {
      const mockResponse = {
        createdAt: '',
        id: '1',
        payment: {
          status: PaymentStatusEnum.STATUS_PAID,
          specificStatus: PaymentSpecificStatusEnum.STATUS_SIGNED,
        },
        paymentItems: [],
        paymentDetails: {},
      } as NodePaymentResponseInterface<any>;

      component.paymentResponse = {
        ...mockResponse,
        id: '2',
      } as NodePaymentResponseInterface<any>;

      fixture.detectChanges();

      const updatePaymentSpy = jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockImplementation(() => {
          store.dispatch(new PatchPaymentResponse(mockResponse));

          return of(mockResponse);
        });

      const runUpdatePaymentWithTimeoutObservable =
        component['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.ProcessingSigning, {
          pollingInterval: 2_000,
          maxTimeout: 10_000,
        });

      runUpdatePaymentWithTimeoutObservable.subscribe(() => {
        expect(updatePaymentSpy).toHaveBeenCalled();
        expect(component.paymentResponse).toEqual(mockResponse);
        expect(component.isCheckStatusProcessing).toEqual(true);

        done();
      });
      jest.advanceTimersByTime(5000);
    });

    it('should run update payment with a successful response when branch status', (done) => {
      const mockResponse = {
        createdAt: '',
        id: '1',
        payment: {
          status: PaymentStatusEnum.STATUS_IN_PROCESS,
          specificStatus: PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
        },
        paymentItems: [],
        paymentDetails: {},
      } as NodePaymentResponseInterface<any>;

      component.paymentResponse = {
        ...mockResponse,
        id: '2',
      } as NodePaymentResponseInterface<any>;

      fixture.detectChanges();

      const updatePaymentSpy = jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockImplementation(() => {
          store.dispatch(new PatchPaymentResponse(mockResponse));

          return of(mockResponse);
        });
      const runUpdatePaymentWithTimeoutObservable =
        component['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL, {
          pollingInterval: 2_000,
          maxTimeout: 10_000,
        });

      runUpdatePaymentWithTimeoutObservable.subscribe(() => {
        expect(updatePaymentSpy).toHaveBeenCalled();
        expect(component.paymentResponse).toEqual(mockResponse);
        expect(component.isCheckStatusProcessing).toEqual(false);

        done();
      });
      jest.advanceTimersByTime(5000);
    });

    it('should handle if timeout is out', (done) => {
      const mockResponse = {
        createdAt: '',
        id: '1',
        payment: {
          status: PaymentStatusEnum.STATUS_IN_PROCESS,
          specificStatus: PaymentSpecificStatusEnum.STATUS_PENDING,
        },
        paymentItems: [],
        paymentDetails: {},
      } as NodePaymentResponseInterface<any>;

      component.paymentResponse = {
        ...mockResponse,
        id: '2',
      } as NodePaymentResponseInterface<any>;


      fixture.detectChanges();

      const updatePaymentSpy = jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockImplementation(() => {
          store.dispatch(new PatchPaymentResponse(mockResponse));

          return throwError(new PollingError('timeout', 'Polling timeout!'));
        });

      const runUpdatePaymentWithTimeoutObservable =
        component['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL, {
          pollingInterval: 2_000,
          maxTimeout: 10_000,
        });

      runUpdatePaymentWithTimeoutObservable.subscribe(() => {
        expect(updatePaymentSpy).toHaveBeenCalled();
        expect(component.paymentResponse).toEqual(mockResponse);
        expect(component.isUpdatePaymentTimeout).toEqual(true);

        done();
      });
      jest.advanceTimersByTime(5 * 60 * 1000 + 1000);
    });

    it('should handle errors during update payment', (done) => {
      component.paymentResponse = {
        createdAt: '',
        id: '1',
        payment: {
          status: PaymentStatusEnum.STATUS_PAID,
        },
        paymentDetails: {},
      } as NodePaymentResponseInterface<any>;

      fixture.detectChanges();

      const mockError = {
        errors: {
          invalid: 'test',
        },
        message: 'message',
      };

      const updatePaymentSpy = jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(throwError(mockError));

      const runUpdatePaymentWithTimeoutObservable =
        component['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL, {
          pollingInterval: 2_000,
          maxTimeout: 10_000,
        });


      runUpdatePaymentWithTimeoutObservable.subscribe(() => {
        expect(updatePaymentSpy).toHaveBeenCalled();
        expect(component.errors).toEqual(mockError.errors);
        expect(component.errorMessage).toEqual(mockError.message);
        expect(component.isCheckStatusProcessing).toEqual(false);
        expect(component.isWaitingForSignUrl).toEqual(false);
        expect(component.isUpdatePaymentTimeout).toEqual(false);

        done();
      });
      jest.advanceTimersByTime(5000);
    });

    it('should handle unknown errors during update payment', (done) => {
      component.paymentResponse = {
        createdAt: '',
        id: '1',
        payment: {
          status: PaymentStatusEnum.STATUS_PAID,
        },
        paymentDetails: {},
      } as NodePaymentResponseInterface<any>;

      fixture.detectChanges();

      const mockError = {
        errors: {
          invalid: 'test',
        },
        message: '',
      };

      const updatePaymentSpy = jest.spyOn(component['nodeFlowService'], 'updatePayment')
        .mockReturnValue(throwError(mockError));

      const runUpdatePaymentWithTimeoutObservable =
        component['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL, {
          pollingInterval: 2_000,
          maxTimeout: 10_000,
        });


      runUpdatePaymentWithTimeoutObservable.subscribe(() => {
        expect(updatePaymentSpy).toHaveBeenCalled();
        expect(component.errors).toEqual(mockError.errors);
        expect(component.errorMessage).toEqual('Cant update payment from server');
        expect(component.isCheckStatusProcessing).toEqual(false);
        expect(component.isWaitingForSignUrl).toEqual(false);
        expect(component.isUpdatePaymentTimeout).toEqual(false);

        done();
      });
      jest.advanceTimersByTime(5000);
    });

  });

});
