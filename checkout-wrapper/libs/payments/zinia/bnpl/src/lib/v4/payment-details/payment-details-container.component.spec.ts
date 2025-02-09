import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { BaseContainerComponent } from '../../shared';
import { flowWithPaymentOptionsFixture } from '../../test/fixtures';
import { ZiniaPaymentService } from '../services';

import { PaymentDetailsContainerComponent } from './payment-details-container.component';

describe('zinia-bnpl-payment-details-container', () => {
  let fixture: ComponentFixture<PaymentDetailsContainerComponent>;
  let component: PaymentDetailsContainerComponent;

  let store: Store;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentDetailsContainerComponent,
        AddressStorageService,
        PaymentInquiryStorage,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: ZiniaPaymentService,
        },
      ],
      declarations: [
        PaymentDetailsContainerComponent,
      ],
    });
    fixture = TestBed.createComponent(PaymentDetailsContainerComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof BaseContainerComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('Should emit continue on init', () => {
      const emitContinue = jest.spyOn(component.continue, 'emit');
      component.ngOnInit();
      expect(emitContinue).toBeCalledTimes(1);
    });
  });
});
