import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import * as rxjs from 'rxjs';
import { interval, of, Subscription } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { PatchPaymentResponse, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../test/fixtures';
import { SantanderSePaymentStateService } from '../common';
import { UpdatePaymentModeEnum } from '../enums';

import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let instance: PaymentService;
  let nodeFlowService: NodeFlowService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentService,
        NodeFlowService,
        SantanderSePaymentStateService,
      ],
      declarations: [],
    });
    instance = TestBed.inject(PaymentService);
    nodeFlowService = TestBed.inject(NodeFlowService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
      expect(instance instanceof AbstractPaymentService).toBeTruthy();
    });
  });

  describe('runUpdatePaymentWithTimeout', () => {
    let unsubscribe: jest.SpyInstance;
    let updatePayment: jest.SpyInstance;
    const paymentResponse = PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null);

    beforeEach(() => {
      jest.spyOn(rxjs, 'interval').mockReturnValue(interval(100));
      unsubscribe = jest.spyOn(Subscription.prototype, 'unsubscribe');
      updatePayment = jest.spyOn(nodeFlowService, 'updatePayment').mockReturnValue(of(paymentResponse));
    });

    it('should runUpdatePaymentWithTimeout handle if mode ProcessingSigning', (done) => {
      jest.spyOn(instance as any, 'checkIsUpdatePaymentRequired').mockReturnValue(false);
      jest.spyOn(Date, 'now').mockReturnValue(0);
      instance['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.ProcessingSigning);
      setTimeout(() => {
        expect(updatePayment).toHaveBeenCalled();
        expect(unsubscribe).toHaveBeenCalled();
        done();
      }, 500);
    });

    it('should runUpdatePaymentWithTimeout handle if mode WaitingForSigningURL', (done) => {
      jest.spyOn(instance as any, 'checkIsWaitingForSignUrl').mockReturnValue(false);
      jest.spyOn(Date, 'now').mockReturnValue(0);
      const isReadyForStartSigningNext = jest.spyOn(instance['paymentStateService'].isReadyForStartSigning$, 'next');
      instance['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL);
      setTimeout(() => {
        expect(updatePayment).toHaveBeenCalled();
        expect(isReadyForStartSigningNext).toHaveBeenCalledWith(true);
        expect(unsubscribe).toHaveBeenCalled();
        done();
      }, 500);

    });

    it('should runUpdatePaymentWithTimeout handle timeout is out', (done) => {
      jest.spyOn(instance as any, 'checkIsUpdatePaymentRequired').mockReturnValue(true);
      jest.spyOn(instance as any, 'checkIsWaitingForSignUrl').mockReturnValue(true);
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(5 * 60 * 1000 + 1000);
      instance['runUpdatePaymentWithTimeout'](UpdatePaymentModeEnum.WaitingForSigningURL);
      setTimeout(() => {
        expect(updatePayment).toHaveBeenCalled();
        expect(unsubscribe).toHaveBeenCalled();
        done();
      }, 500);
    });
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

  describe('postPayment', () => {
    it('Should postPayment', (done) => {
      const paymentResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.STATUS_PENDING,
      );
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(paymentResponse));

      instance.postPayment().subscribe((response) => {
        expect(response).toEqual(paymentResponse);
        expect(postPayment).toHaveBeenCalled();
        done();
      });
    });

    it('Should return response if available', (done) => {
      const paymentResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.STATUS_PENDING,
      );
      store.dispatch(new PatchPaymentResponse(paymentResponse));
      const postPayment = jest.spyOn(nodeFlowService, 'postPayment')
        .mockReturnValue(of(paymentResponse));
      instance.postPayment().subscribe((response) => {
        expect(response).toEqual(paymentResponse);
        expect(postPayment).not.toHaveBeenCalled();
        done();
      });
    });
  });
});


