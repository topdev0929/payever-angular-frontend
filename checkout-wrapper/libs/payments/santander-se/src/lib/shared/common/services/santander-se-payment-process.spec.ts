import { HttpErrorResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { throwError, of, interval } from 'rxjs';
import * as rxjs from 'rxjs';
import { skip, tap } from 'rxjs/operators';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, peEnvFixture } from '@pe/checkout/testing';
import {
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { MobileSigningStatusesEnum, UpdatePaymentModeEnum } from '../../enums';
import { NodePaymentResponseDetailsInterface } from '../types';

import { SantanderSeApiService } from './santander-se-api.service';
import { SantanderSeFlowService } from './santander-se-flow.service';
import { SantanderSePaymentProcessService } from './santander-se-payment-process';
import { SantanderSePaymentStateService } from './santander-se-payment-state';

jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  isDevMode: jest.fn(),
}));

describe('SantanderSePaymentProcessService', () => {
  let instance: SantanderSePaymentProcessService;
  let nodeFlowService: NodeFlowService;
  let paymentStateService: SantanderSePaymentStateService;
  let santanderSeFlowService: SantanderSeFlowService;
  let topLocationService: TopLocationService;
  let externalRedirectStorage: ExternalRedirectStorage;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderSePaymentProcessService,
        NodeFlowService,
        SantanderSePaymentStateService,
        SantanderSeFlowService,
        SantanderSeApiService,
        MockProvider(TopLocationService),
        {
          provide: LocaleConstantsService,
          useValue: {
            getLang: jest.fn().mockReturnValue('sv'),
          },
        },
      ],
      declarations: [],
    });
    nodeFlowService = TestBed.inject(NodeFlowService);
    paymentStateService = TestBed.inject(SantanderSePaymentStateService);
    santanderSeFlowService = TestBed.inject(SantanderSeFlowService);
    topLocationService = TestBed.inject(TopLocationService);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    instance = TestBed.inject(SantanderSePaymentProcessService);

  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  const paymentResponseWithDetails = (paymentDetails: NodePaymentResponseDetailsInterface) => ({
    ...PaymentResponseWithStatus(
      PaymentStatusEnum.STATUS_NEW,
      PaymentSpecificStatusEnum.NEED_MORE_INFO,
    ),
    paymentDetails,
  });

  describe('service', () => {

    it('preparePaymentData', () => {
      const initialData = paymentResponseWithDetails({
        signingUrl: 'signing-url',
        mobileSigningStatus: MobileSigningStatusesEnum.Created,
      });
      const paymentResponse = paymentResponseWithDetails(null);
      const prepareData = jest.fn().mockReturnValue(paymentResponse);

      instance.init(initialData, prepareData);
      expect(paymentStateService.paymentResponse).toBe(initialData);
      expect(instance.prepareData).toBe(prepareData);

      const formData: any = {
        ssnForm: null,
      };
      const assignPaymentDetails = jest.spyOn(nodeFlowService, 'assignPaymentDetails');
      instance.preparePaymentData(formData).subscribe();
      expect(instance.prepareData).toBeCalledWith(formData);
      expect(assignPaymentDetails).toBeCalledWith({
        ...paymentResponse,
        employmentType: 'Permanent',
        frontendFailureUrl: instance['wrapperUrl'](),
        frontendSuccessUrl: instance['wrapperUrl']('complete'),
      });
    });

    describe('processErrors', () => {
      let isCheckStatusProcessing: jest.SpyInstance;
      let isWaitingForSignUrl: jest.SpyInstance;
      let isUpdatePaymentTimeout: jest.SpyInstance;
      let errorNext: jest.SpyInstance;

      beforeEach(() => {
        isCheckStatusProcessing = jest.spyOn(paymentStateService.isCheckStatusProcessing$, 'next');
        isWaitingForSignUrl = jest.spyOn(paymentStateService.isWaitingForSignUrl$, 'next');
        isUpdatePaymentTimeout = jest.spyOn(paymentStateService.isUpdatePaymentTimeout$, 'next');
        errorNext = jest.spyOn(paymentStateService.error$, 'next');
      });

      it('should handle processErrors', () => {
        const responseError: ResponseErrorsInterface = {
          code: 400,
          errors: {
            ssn: 'invalid',
            amount: 'required',
          },
          message: null,
          raw: null,
        };
        instance.processErrors(responseError);
        expect(isCheckStatusProcessing).toBeCalledWith(false);
        expect(isWaitingForSignUrl).toBeCalledWith(false);
        expect(isUpdatePaymentTimeout).toBeCalledWith(false);
        expect(errorNext).toBeCalledWith({
          error: responseError.errors,
          errorMessage: 'invalid, required',
        });
      });

      it('should handle if errors null', () => {
        const responseError: ResponseErrorsInterface = {
          code: 400,
          errors: null,
          message: 'Error message',
          raw: null,
        };
        instance.processErrors(responseError);
        expect(isCheckStatusProcessing).toBeCalledWith(false);
        expect(isWaitingForSignUrl).toBeCalledWith(false);
        expect(isUpdatePaymentTimeout).toBeCalledWith(false);
        expect(errorNext).toBeCalledWith({ error: responseError.errors, errorMessage: responseError.message });
      });
    });

    describe('onStartSigning', () => {

      it('should not start two signing processes simultaneously', () => {
        const signingRes = paymentResponseWithDetails({
          signingUrl: 'signing-url',
          mobileSigningStatus: MobileSigningStatusesEnum.Created,
        });

        const startMobileSigning = jest.spyOn(santanderSeFlowService, 'startMobileSigning')
          .mockReturnValue(of(signingRes));
        instance.onStartSigning();
        instance.onStartSigning();

        expect(startMobileSigning).toBeCalledTimes(1);
      });
      it('should close on error', (done) => {
        const startMobileSigning = jest.spyOn(santanderSeFlowService, 'startMobileSigning')
          .mockReturnValue(throwError(new HttpErrorResponse({})));
        paymentStateService.isCheckStatusProcessing$.pipe(
          skip(1),
          tap((v) => {
            if (!v) {
              done();
            }
          }),
        ).subscribe();
        instance.onStartSigning();
        expect(startMobileSigning).toBeCalledTimes(1);
      });
      it('wait for ProcessingSigning', (done) => {
        const href = jest.spyOn(topLocationService, 'href', 'set').mockImplementation(jest.fn);

        const signingRes = paymentResponseWithDetails({
          signingUrl: 'signing-url',
          mobileSigningStatus: MobileSigningStatusesEnum.Created,
        });
        const saveDataBeforeRedirect = jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect')
          .mockReturnValue(of(null));
        jest.spyOn(rxjs, 'interval')
          .mockReturnValue(interval(10));

        const startMobileSigning = jest.spyOn(santanderSeFlowService, 'startMobileSigning')
          .mockReturnValue(of(signingRes));

        instance.onStartSigning();
        santanderSeFlowService.startMobileSigning().subscribe({
          next: () => {
            done();
          },
        });

        expect(saveDataBeforeRedirect).toHaveBeenCalledTimes(1);
        expect(startMobileSigning).toBeCalledTimes(2);
        expect(href).toBeCalledTimes(1);
      });
    });
  });

  it('should checkIsWaitingForSignUrl perform correctly', () => {

    expect(instance['checkIsWaitingForSignUrl']({
      payment: {
        specificStatus: PaymentSpecificStatusEnum.STATUS_PENDING,
      },
    } as any)).toEqual(true);
    expect(instance['checkIsWaitingForSignUrl']({
      payment: {
        specificStatus: PaymentSpecificStatusEnum.STATUS_PENDING,
      },
      paymentDetails: {
        signingUrl: 'signingUrl',
      },
    } as any)).toEqual(false);

  });

  it('should checkIsUpdatePaymentRequired perform correctly', () => {

    expect(instance['checkIsUpdatePaymentRequired']({
      payment: {
        status: PaymentStatusEnum.STATUS_ACCEPTED,
      },
      paymentDetails: {
        signingUrl: 'signingUrl',
      },
    } as any)).toEqual(false);
    expect(instance['checkIsUpdatePaymentRequired']({
      payment: {
        status: PaymentStatusEnum.STATUS_DECLINED,
      },
      paymentDetails: {
        signingUrl: 'signingUrl',
      },
    } as any)).toEqual(false);
    expect(instance['checkIsUpdatePaymentRequired']({
      payment: {
        status: PaymentStatusEnum.STATUS_PAID,
      },
    } as any)).toEqual(false);

    expect(instance['checkIsUpdatePaymentRequired']({
      payment: {
        status: PaymentStatusEnum.STATUS_PAID,
      },
      paymentDetails: {
        signingUrl: 'signingUrl',
        mobileSigningStatus: MobileSigningStatusesEnum.Completed,
      },
    } as any)).toEqual(false);

    expect(instance['checkIsUpdatePaymentRequired']({
      payment: {
        status: PaymentStatusEnum.STATUS_PAID,
      },
      paymentDetails: {
        signingUrl: 'signingUrl',
      },
    } as any)).toEqual(true);

  });

  describe('checkIsWaitingForSignUrl', () => {
    it('should checkIsWaitingForSignUrl return true', () => {
      expect(instance['checkIsWaitingForSignUrl'](PaymentResponseWithStatus(
        null,
        PaymentSpecificStatusEnum.STATUS_PENDING,
      ))).toBeTruthy();
      expect(instance['checkIsWaitingForSignUrl'](PaymentResponseWithStatus(
        null, null)),
      ).toBeTruthy();
    });
    it('should checkIsWaitingForSignUrl return false', () => {
      expect(instance['checkIsWaitingForSignUrl'](PaymentResponseWithStatus(
        null,
        PaymentSpecificStatusEnum.STATUS_APPROVED,
      ))).toBeFalsy();
    });
  });

  describe('checkIsUpdatePaymentRequired', () => {
    it('should checkIsUpdatePaymentRequired return true', () => {
      const res = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);
      const responseWithSigningUrl = {
        ...res,
        paymentDetails: {
          ...res.paymentDetails,
          signingUrl: 'signingUrl',
        },
      };
      expect(instance['checkIsUpdatePaymentRequired'](responseWithSigningUrl)).toBeTruthy();
    });
    it('should checkIsUpdatePaymentRequired return false', () => {
      expect(instance['checkIsUpdatePaymentRequired'](PaymentResponseWithStatus(
        null,
        null,
      ))).toBeFalsy();
      expect(instance['checkIsUpdatePaymentRequired'](PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_ACCEPTED,
        null,
      ))).toBeFalsy();
      expect(instance['checkIsUpdatePaymentRequired'](PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_DECLINED,
        null,
      ))).toBeFalsy();
    });
  });


  describe('wrapperUrl', () => {
    const checkoutWrapper = peEnvFixture().frontend.checkoutWrapper;
    const lang = 'en';
    const flowId = flowWithPaymentOptionsFixture().id;

    beforeEach(() => {
      jest.spyOn(instance['localeConstantsService'], 'getLang').mockReturnValue(lang);
    });

    it('should get correct url if isDevMode false', () => {
      (isDevMode as jest.Mock).mockReturnValue(false);
      const expectedUrl = new URL(`${checkoutWrapper}/${lang}/pay/${flowId}/redirect-to-payment`);
      expectedUrl.searchParams.set('guest_token', undefined);
      expect(instance['wrapperUrl']()).toEqual(expectedUrl.toString());
    });
    it('should get correct url if isDevMode true', () => {
      (isDevMode as jest.Mock).mockReturnValue(true);
      const expectedUrl = new URL(`${window.origin}/${lang}/pay/${flowId}/redirect-to-payment`);
      expectedUrl.searchParams.set('guest_token', undefined);
      expect(instance['wrapperUrl']()).toEqual(expectedUrl.toString());
    });
  });

  describe('runUpdatePaymentWithTimeout', () => {
    let updatePayment: jest.SpyInstance;
    const paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);

    beforeEach(() => {
      jest.spyOn(rxjs, 'interval').mockReturnValue(interval(100));
      updatePayment = jest.spyOn(nodeFlowService, 'updatePayment').mockReturnValue(of(paymentResponse));
    });

    it('should runUpdatePaymentWithTimeout handle if mode ProcessingSigning', (done) => {
      jest.spyOn(instance as any, 'checkIsUpdatePaymentRequired').mockReturnValue(false);
      jest.spyOn(Date, 'now').mockReturnValue(0);
      const isUpdatePaymentTimeoutNext = jest.spyOn(instance['paymentStateService'].isUpdatePaymentTimeout$, 'next');
      const isCheckStatusProcessingNext = jest.spyOn(instance['paymentStateService'].isCheckStatusProcessing$, 'next');
      instance['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.ProcessingSigning).subscribe((res) => {
        expect(res).toEqual(paymentResponse);
        expect(isCheckStatusProcessingNext).toHaveBeenCalledWith(true);
        expect(isUpdatePaymentTimeoutNext).toHaveBeenCalledWith(false);
        expect(paymentStateService.paymentResponse).toEqual(paymentResponse);
        expect(updatePayment).toHaveBeenCalled();
        done();
      });
    });

    it('should runUpdatePaymentWithTimeout handle if mode WaitingForSigningURL', (done) => {
      jest.spyOn(instance as any, 'checkIsWaitingForSignUrl').mockReturnValue(false);
      jest.spyOn(Date, 'now').mockReturnValue(0);
      const isReadyForStartSigningNext = jest.spyOn(instance['paymentStateService'].isReadyForStartSigning$, 'next');
      const isUpdatePaymentTimeoutNext = jest.spyOn(instance['paymentStateService'].isUpdatePaymentTimeout$, 'next');
      const isCheckStatusProcessingNext = jest.spyOn(instance['paymentStateService'].isCheckStatusProcessing$, 'next');
      const isWaitingForSignUrlNext = jest.spyOn(instance['paymentStateService'].isWaitingForSignUrl$, 'next');
      instance['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL).subscribe((res) => {
        expect(res).toEqual(paymentResponse);
        expect(isCheckStatusProcessingNext).toHaveBeenCalledWith(true);
        expect(isWaitingForSignUrlNext).toHaveBeenCalledWith(true);
        expect(isUpdatePaymentTimeoutNext).toHaveBeenCalledWith(false);
        expect(paymentStateService.paymentResponse).toEqual(paymentResponse);
        expect(updatePayment).toHaveBeenCalled();
        expect(isReadyForStartSigningNext).toHaveBeenCalledWith(true);
        done();
      });
    });

    it('should runUpdatePaymentWithTimeout handle timeout is out', (done) => {
      jest.spyOn(instance as any, 'checkIsUpdatePaymentRequired').mockReturnValue(true);
      jest.spyOn(instance as any, 'checkIsWaitingForSignUrl').mockReturnValue(true);
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(5 * 60 * 1000 + 1000);
      const isUpdatePaymentTimeoutNext = jest.spyOn(instance['paymentStateService'].isUpdatePaymentTimeout$, 'next');
      const isCheckStatusProcessingNext = jest.spyOn(instance['paymentStateService'].isCheckStatusProcessing$, 'next');
      const isWaitingForSignUrlNext = jest.spyOn(instance['paymentStateService'].isWaitingForSignUrl$, 'next');

      instance['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL).subscribe((res) => {
        expect(res).toEqual(paymentResponse);
        expect(paymentStateService.paymentResponse).toEqual(paymentResponse);
        expect(updatePayment).toHaveBeenCalled();

        expect(isCheckStatusProcessingNext).toHaveBeenNthCalledWith(1, true);
        expect(isUpdatePaymentTimeoutNext).toHaveBeenNthCalledWith(1, false);

        expect(isUpdatePaymentTimeoutNext).toHaveBeenNthCalledWith(2, true);
        expect(isCheckStatusProcessingNext).toHaveBeenNthCalledWith(2, false);
        expect(isWaitingForSignUrlNext).toHaveBeenCalledWith(false);
        done();
      });
    });
  });


});
