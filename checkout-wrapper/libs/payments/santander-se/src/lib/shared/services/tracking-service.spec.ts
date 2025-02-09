import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';

import { TrackingService } from '@pe/checkout/api';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures';

import { SeTrackingService } from './tracking-service';


describe('PaymentService', () => {
  let instance: SeTrackingService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SeTrackingService,
        MockProvider(TrackingService),
      ],
      declarations: [
      ],
    });
    instance = TestBed.inject(SeTrackingService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
      expect(instance instanceof TrackingService).toBeTruthy();
    });
  });

  describe('service', () => {
    it('doEmitBankIdStepPassed', () => {
      const flowId = 'flow-id';
      const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_SE;
      const doEmitEvent = jest.spyOn(TrackingService.prototype as any, 'doEmitEvent');
      instance.doEmitBankIdStepPassed(flowId, paymentMethod);
      expect(doEmitEvent).toHaveBeenCalledWith(flowId, paymentMethod, 'bank_id_step_passed');
    });
  });
});


