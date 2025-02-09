import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroupDirective, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { RateInterface, SharedModule } from '../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture, ratesFixture } from '../../../test';
import { RatesEditListComponent } from '../rates-edit-list';
import { TermsFormComponent } from '../terms-form';

import { RatesFormComponent } from './rates-form.component';

describe('RatesFormComponent', () => {

  let component: RatesFormComponent;
  let fixture: ComponentFixture<RatesFormComponent>;

  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        RatesFormComponent,
        RatesEditListComponent,
        TermsFormComponent,
      ],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(RatesFormComponent);
    component = fixture.componentInstance;

    component.flow = flowWithPaymentOptionsFixture();
    component.paymentTitle = 'Santander DK';
    component.embeddedMode = true;
    component.paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_DK;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create the form with initial form controls', () => {

    expect(component.formGroup.get('ratesForm')).toBeDefined();
    expect(component.formGroup.get('ratesForm').validator).toBeTruthy();

    expect(component.formGroup.get('termsForm')).toBeDefined();
    expect(component.formGroup.get('termsForm').validator).toBeTruthy();

    expect(component.formGroup.value).toMatchObject({
      ratesForm: null,
      termsForm: null,
    });
    expect(component.formGroup.valid).toBeFalsy();

  });

  it('should patch store values to the form on initialization', () => {

    component.ngOnInit();

    expect(component.formGroup.value).toMatchObject({
      ratesForm: paymentFormFixture().ratesForm,
      termsForm: paymentFormFixture().termsForm,
    });

  });

  it('should emit selectRate event with correct rate on onProductOrRateSelected', () => {

    const selectRateEmitSpy = jest.spyOn(component.selectRate, 'emit');

    component.onProductOrRateSelected(ratesFixture()[0]);

    expect(selectRateEmitSpy).toHaveBeenCalledWith(ratesFixture()[0]);

  });

  it('should onProductOrRateSelected handle undefined monthlyAdministrationFee', () => {

    const transformedFee = 'fee';
    const rate: RateInterface = {
      ...ratesFixture()[0],
      parameters: {
        ...ratesFixture()[0].parameters,
        monthlyAdministrationFee: null,
      },
    };
    const selectRateEmitSpy = jest.spyOn(component.selectRate, 'emit');
    const currencyPipeTransform = jest.spyOn(component['currencyPipe'], 'transform')
      .mockReturnValue(transformedFee);
    const selectedRateTitleNext = jest.spyOn(component.selectedRateTitle$, 'next');

    component.onProductOrRateSelected(rate);

    expect(selectRateEmitSpy).toHaveBeenCalledWith(rate);
    expect(currencyPipeTransform).toHaveBeenCalledWith(
      0,
      flowWithPaymentOptionsFixture().currency,
      'symbol',
      '1.2-2',
    );
    expect(selectedRateTitleNext).toHaveBeenCalledWith(
      $localize`:@@santander-dk.credit_rates.monthly_administration_fee_note:\
      ${transformedFee}:monthly_administration_fee:`,
    );

  });

  it('should set selectedRateTitle$ value correctly when a product or rate is selected', (done) => {

    const expectedFee = 'formatted fee';
    jest.spyOn(component['currencyPipe'], 'transform').mockReturnValue(expectedFee);

    component.onProductOrRateSelected(ratesFixture()[0]);
    component.selectedRateTitle$.subscribe((title) => {
      expect(title).toContain(expectedFee);
      done();
    });

  });

  it('emit submitted', (done) => {
    component['formGroupDirective'] = {
      onSubmit: jest.fn(),
    } as unknown as FormGroupDirective;


    component.ngOnInit();
    component.submitted.subscribe((v) => {
      expect(v).toEqual(component.formGroup.value);
      done();
    });

    component.formGroup.updateValueAndValidity();
    component['submit$'].next(Date.now());
  });

});
