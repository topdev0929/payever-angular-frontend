import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { DialogService } from '@pe/checkout/dialog';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../test';
import { RateDetailsDialogComponent } from '../rate-details-dialog/rate-details-dialog.component';

import { FormComponent } from './form.component';

describe('FormComponent', () => {

  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  let store: Store;
  let dialogService: DialogService;

  const baseDate = new Date(Date.UTC(2023, 10, 23));
  const expectedDate = '23.11.2023';

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        DialogService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_UK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
        },
      },
    }));
    dialogService = TestBed.inject(DialogService);
    jest.spyOn(global, 'Date').mockReturnValue(baseDate);

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should defined form with correct initial values', () => {

    expect(component.formGroup.get('duration').value).toBeNull();
    expect(component.formGroup.get('duration').validator).toBeTruthy();

    expect(component.formGroup.get('downPayment').value).toBeNull();
    expect(component.formGroup.get('downPayment').validator).toBeFalsy();

    expect(component.formGroup.get('interestRate').value).toBeNull();
    expect(component.formGroup.get('interestRate').validator).toBeFalsy();

    expect(component.formGroup.get('flatRate').value).toBeNull();
    expect(component.formGroup.get('flatRate').validator).toBeFalsy();

    expect(component.formGroup.get('monthlyPayment').value).toBeNull();
    expect(component.formGroup.get('monthlyPayment').validator).toBeFalsy();

    expect(component.formGroup.get('firstMonthPayment').value).toBeNull();
    expect(component.formGroup.get('firstMonthPayment').validator).toBeFalsy();

    expect(component.formGroup.get('lastMonthPayment').value).toBeNull();
    expect(component.formGroup.get('lastMonthPayment').validator).toBeFalsy();

    expect(component.formGroup.get('interest').value).toBeNull();
    expect(component.formGroup.get('interest').validator).toBeFalsy();

    expect(component.formGroup.get('totalCreditCost').value).toBeNull();
    expect(component.formGroup.get('totalCreditCost').validator).toBeFalsy();

    expect(component.formGroup.get('amount').value).toBeNull();
    expect(component.formGroup.get('amount').validator).toBeFalsy();

    expect(component.formGroup.get('_deposit_view').value).toBeNull();
    expect(component.formGroup.get('_deposit_view').validator).toBeFalsy();

  });

  it('should patch form on init', () => {

    const patchValueSpy = jest.spyOn(component.formGroup, 'patchValue');
    const selectSnapshotSpy = jest.spyOn(store, 'selectSnapshot');

    component.ngOnInit();

    expect(patchValueSpy).toHaveBeenCalled();
    expect(selectSnapshotSpy).toHaveBeenCalled();
    expect(component.formGroup.value).toEqual(paymentFormFixture());

  });

  it('should return correct downPayment$', (done) => {

    const expectedDownPayment = 100;
    component.formGroup.get('downPayment').patchValue(expectedDownPayment);

    component.downPayment$.subscribe((downPayment) => {
      expect(downPayment).toEqual(expectedDownPayment);

      done();
    });

  });

  it('should showApply$ return true', (done) => {

    const depositControl = new FormControl();
    const downPaymentControl = new FormControl();

    component.formGroup.setControl('_deposit_view', depositControl);
    component.formGroup.setControl('downPayment', downPaymentControl);

    const depositSubject = new Subject();
    const downSubject = new Subject();

    depositSubject.subscribe(value => depositControl.setValue(value));
    downSubject.subscribe(value => downPaymentControl.setValue(value));

    component.isRatesLoading = false;

    component.showApply$.pipe(take(1)).subscribe({
      next: (condition) => {
        expect(condition).toBe(true);

        done();
      },
      error: done,
    });

    depositSubject.next(1000);
    downSubject.next(2000);

  });

  it('should showApply$ return false', (done) => {

    const depositControl = new FormControl();
    const downPaymentControl = new FormControl();

    component.formGroup.setControl('_deposit_view', depositControl);
    component.formGroup.setControl('downPayment', downPaymentControl);

    const depositSubject = new Subject();
    const downSubject = new Subject();

    depositSubject.subscribe(value => depositControl.setValue(value));
    downSubject.subscribe(value => downPaymentControl.setValue(value));

    component.isRatesLoading = true;

    component.showApply$.pipe(take(1)).subscribe({
      next: (condition) => {
        expect(condition).toBe(false);

        done();
      },
      error: done,
    });

    depositSubject.next(1000);
    downSubject.next(1000);

  });

  it('should todayAsStr return correct value', () => {

    expect(component.todayAsStr).toEqual(expectedDate);

  });

  it('should onRateSelected update selected rate', () => {

    const patchValueSpy = jest.spyOn(component.formGroup, 'patchValue');
    const selectRateEmitSpy = jest.spyOn(component.selectRate, 'emit');

    const mockSelected: any = { rate: { amount: 1500 }, data: paymentFormFixture() };

    component.onRateSelected(mockSelected);

    expect(patchValueSpy).toHaveBeenCalledWith(paymentFormFixture(), { emitEvent: false });
    expect(component.selectedRate).toEqual(mockSelected.rate);
    expect(selectRateEmitSpy).toHaveBeenCalledWith(mockSelected.rate);

  });

  it('should open dialogService on onInfoButtonClicked', () => {

    const expectedData = {
      flowId: flowWithPaymentOptionsFixture().id,
      currency: flowWithPaymentOptionsFixture().currency,
      rate: component.selectedRate,
      total: flowWithPaymentOptionsFixture().total,
      cart: flowWithPaymentOptionsFixture().cart,
      businessName: flowWithPaymentOptionsFixture().businessName,
    };

    const openSpy = jest.spyOn(dialogService, 'open');

    component.onInfoButtonClicked();

    expect(openSpy).toHaveBeenCalledWith(RateDetailsDialogComponent, null, expectedData, 'pe-payment-info-dialog');

  });

  it('should set _deposit_view value to downPayment on apply', () => {

    const expectedValue = 800;
    component.formGroup.get('_deposit_view').patchValue(expectedValue);

    expect(component.formGroup.get('downPayment').value).toBeNull();
    component.apply();
    expect(component.formGroup.get('downPayment').value).toEqual(expectedValue);

  });

  it('should return translations', () => {

    const expectedValue = {
      note1: $localize`:@@payment-santander-uk.inquiry.note1:${flowWithPaymentOptionsFixture().businessName}:businessName:`,
      note2: $localize`:@@payment-santander-uk.inquiry.note2:${component.todayAsStr}:today:`,
    };

    expect(component.translations).toEqual(expectedValue);

  });

  it('should handle submitted when form valid', (done) => {

    Date.now = jest.fn();
    component.formGroup.setValue(paymentFormFixture() as any);

    component.submitted.subscribe((value) => {
      expect(component.formGroup.valid).toBeTruthy();
      expect(value).toEqual(paymentFormFixture());

      done();
    });

    component['submit$'].next();

  });

});
