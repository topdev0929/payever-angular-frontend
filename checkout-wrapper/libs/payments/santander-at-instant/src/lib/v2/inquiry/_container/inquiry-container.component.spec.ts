import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE, PaymentSubmissionService } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { InquiryContainerComponent } from './inquiry.component';

describe('InquiryContainerComponent', () => {
  const storeHelper = new StoreHelper();
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        InquiryContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        {
          provide: LocaleConstantsService,
          useValue: {
            getLang: jest.fn().mockReturnValue('de-DE'),
          },
        },
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
    }).compileComponents();

    registerLocaleData(de.default);

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(InquiryContainerComponent);
    component = fixture.componentInstance;
    jest.useFakeTimers();

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });


  describe('triggerSubmit', () => {
    it('should call onSend with empty form data', () => {
      const submit$ = TestBed.inject(PaymentSubmissionService);
      const next = jest.spyOn(submit$, 'next');

      component['triggerSubmit']();

      expect(next).toHaveBeenCalled();
    });
  });

  describe('onSend', () => {
    it('should call sendPaymentData with provided formData', () => {
      const sendPaymentData = jest.spyOn(component as any, 'sendPaymentData');
      const next = jest.spyOn(component.continue, 'next');
      const formData = {};

      component.onSend(formData);

      expect(sendPaymentData).toHaveBeenCalledWith(formData);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sendPaymentData', () => {
    it('should call setPaymentDetails on NodeFlowService and emit continue', () => {
      const setPaymentDetails = jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');
      const formData = {};

      component['sendPaymentData'](formData);

      expect(setPaymentDetails).toHaveBeenCalledWith(formData);
    });
  });
});
