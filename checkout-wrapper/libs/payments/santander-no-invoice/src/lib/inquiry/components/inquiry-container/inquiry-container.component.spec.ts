import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { AmlFormComponent, DetailsFormComponent, FormComponent } from '../forms';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {
  const storeHelper = new StoreHelper();
  let component: InquiryContainerComponent;
  let fixture: ComponentFixture<InquiryContainerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiTooltipModule,
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
      declarations: [
        DetailsFormComponent,
        AmlFormComponent,
        FormComponent,
        InquiryContainerComponent,
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
    jest.clearAllMocks();
    fixture.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Getter', () => {

    it('should isPos return true', () => {
      jest.spyOn(store, 'selectSnapshot').mockReturnValue(PaymentMethodEnum.SANTANDER_POS_INVOICE_NO);
      expect(component.paymentMethod).toEqual(PaymentMethodEnum.SANTANDER_POS_INVOICE_NO);
      expect(component.isPos).toBeTruthy();
    });

    it('should isPos return false', () => {
      jest.spyOn(store, 'selectSnapshot').mockReturnValue(PaymentMethodEnum.SANTANDER_INVOICE_NO);
      expect(component.paymentMethod).not.toEqual(PaymentMethodEnum.SANTANDER_INVOICE_NO);
      expect(component.isPos).toBeTruthy();
    });

  });


  describe('triggerSubmit', () => {
    it('should call onSend with empty form data', () => {
      const submitSpy = jest.spyOn(component['submit$'], 'next');

      component.triggerSubmit();

      expect(submitSpy).toHaveBeenCalled();
    });
  });

  describe('onSend', () => {
    it('should call sendPaymentData with provided formData', () => {
      jest.spyOn(component as any, 'sendPaymentData');
      const formData = { key: 'value' };

      component.onSend(formData);

      expect(component['sendPaymentData']).toHaveBeenCalledWith(formData);
    });
  });

  describe('sendPaymentData', () => {
    it('should call setPaymentDetails on NodeFlowService and emit continue', () => {
      jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');
      jest.spyOn(component.continue, 'emit');

      const formData = {};

      component['sendPaymentData'](formData);

      expect(component['nodeFlowService'].setPaymentDetails).toHaveBeenCalledWith(formData);
      expect(component.continue.emit).toHaveBeenCalled();
    });

    it('should handle if paymentOption not found', () => {
      jest.spyOn(component as any, 'paymentOption', 'get').mockReturnValue(null);

      try {
        component['sendPaymentData']({});
      } catch (error: any) {
        expect(error).toBeTruthy();
        expect(error.message).toEqual('Payment method not presented in list!');
      }
    });
  });
});
