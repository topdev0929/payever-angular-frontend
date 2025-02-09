import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { PaymentState, SetFlow, SetFormState, SetPayments } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../../test';

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
        ...FinishDeclarationsTestHelper(),
        InquiryContainerComponent,
      ],
    }).compileComponents();

    registerLocaleData(de.default);

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow({
      ...flowWithPaymentOptionsFixture(),
      billingAddress: { firstName: 'John', lastName: 'Doe' },
    }));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.INSTANT_PAYMENT]: {
        ...store.selectSnapshot(PaymentState),
      },
    }));
    store.dispatch(new SetFormState({
      senderHolder: 'CustomSender',
      senderIban: 'DE89370400440532013000',
      adsAgreement: true,
    }));

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

  describe('ngOnInit', () => {

    it('should call initPaymentMethod and emit buttonText on ngOnInit', () => {
      jest.spyOn(component['analyticsFormService'], 'initPaymentMethod');
      jest.spyOn(component.buttonText, 'emit');

      component.ngOnInit();

      expect(component['analyticsFormService'].initPaymentMethod)
        .toHaveBeenCalledWith(PaymentMethodEnum.INSTANT_PAYMENT);

      expect(component.buttonText.emit).toHaveBeenCalledWith($localize`:@@payment-instant-payment.actions.pay:`);
    });

    it('should set form values based on paymentForm and flow on ngOnInit', () => {
      component.flow.billingAddress = {};

      component.ngOnInit();

      expect(component.form.value.senderHolder).toEqual('CustomSender');
      expect(component.form.value.senderIban).toEqual('DE89370400440532013000');
      expect(component.form.value.adsAgreement).toEqual(true);
    });

    it('should set form values based on flow even if paymentForm is not provided on ngOnInit', () => {
      component.flow.billingAddress = { firstName: 'John', lastName: 'Doe' };

      jest.spyOn(component, 'paymentForm', 'get').mockReturnValue({
        senderIban: null,
        adsAgreement: false,
      });

      component.ngOnInit();

      expect(component.form.value.senderHolder).toEqual('John Doe');
      expect(component.form.value.senderIban).toBeNull();
      expect(component.form.value.adsAgreement).toEqual(false);
    });

    it('should set form values to null if both flow and paymentForm are not provided on ngOnInit', () => {
      component.flow.billingAddress = {};
      jest.spyOn(component, 'paymentForm', 'get').mockReturnValue(undefined);

      component.ngOnInit();

      expect(component.form.value.senderHolder).toBeNull();
      expect(component.form.value.senderIban).toBeNull();
      expect(component.form.value.adsAgreement).toEqual(false);
    });
  });

  describe('triggerSubmit', () => {
    it('should call ngSubmit, onSubmit, setPaymentDetails, and emit continue when form is valid', () => {
      const formValueMock = {
        senderHolder: 'John Doe',
        senderIban: 'DE89370400440532013000',
        adsAgreement: true,
      } as any;

      component.form.setValue(formValueMock);

      jest.spyOn(component['formGroupDirective'].ngSubmit, 'emit');
      jest.spyOn(component['formGroupDirective'], 'onSubmit');
      jest.spyOn(component.cdr, 'markForCheck');
      jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');
      jest.spyOn(component.continue, 'emit');

      component.triggerSubmit();

      expect(component['formGroupDirective'].ngSubmit.emit).toHaveBeenCalled();
      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
      expect(component.cdr.markForCheck).toHaveBeenCalled();
      expect(component['nodeFlowService'].setPaymentDetails).toHaveBeenCalledWith(formValueMock);
      expect(component.continue.emit).toHaveBeenCalled();
    });

    it('should not call setPaymentDetails and emit continue when form is invalid', () => {

      component.form.setErrors({ 'someError': true });

      jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');
      jest.spyOn(component.continue, 'emit');

      component.triggerSubmit();

      expect(component['nodeFlowService'].setPaymentDetails).not.toHaveBeenCalled();
      expect(component.continue.emit).not.toHaveBeenCalled();
    });
  });
});
