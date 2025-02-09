import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { PaymentState, SetFlow, SetFormState, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture } from '../../../../test';
import { AmlFormComponent } from '../aml-form';
import { DetailsFormComponent } from '../details-form';

import { FormComponent, FormInterface } from './form.component';

describe('FormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiTooltipModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        DetailsFormComponent,
        AmlFormComponent,
        FormComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INVOICE_NO]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: formOptionsInstallmentFixture,
        },
      },
    }));

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });

  describe('submitted', () => {
    it('should emit form value when submit$ emits', (done) => {
      const formValueMock: FormInterface = {
        detailsForm: null,
        amlForm: null,
      };

      component.formGroup.patchValue(formValueMock);

      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
      const emitSpy = jest.spyOn(component['formGroupDirective'].ngSubmit, 'emit');
      const onSubmitSpy = jest.spyOn(component['formGroupDirective'], 'onSubmit');
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const markForCheckSpy = jest.spyOn(component['cdr'], 'markForCheck');

      component.submitted.subscribe(() => {
        expect(emitSpy).toHaveBeenCalledWith(formValueMock);
        expect(onSubmitSpy).toHaveBeenCalledWith(null);
        expect(dispatchSpy).toHaveBeenCalledWith(new SetFormState(formValueMock));
        expect(markForCheckSpy).toHaveBeenCalled();

        done();
      });

      component['submit$'].next();
    });

    it('should filter out invalid forms', () => {
      component.formGroup.setErrors({ someError: true });

      const emitSpy = jest.spyOn(component['formGroupDirective'].ngSubmit, 'emit');
      const onSubmitSpy = jest.spyOn(component['formGroupDirective'], 'onSubmit');
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      const markForCheckSpy = jest.spyOn(component['cdr'], 'markForCheck');

      component['submit$'].next();

      expect(emitSpy).not.toHaveBeenCalled();
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(markForCheckSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should patch the form with payment form data', () => {
      const patchValueSpy = jest.spyOn(component.formGroup, 'patchValue');

      component.ngOnInit();

      expect(patchValueSpy).toHaveBeenCalledWith(component['paymentForm']);
    });
  });
});
