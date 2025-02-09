import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of, Subject, throwError, timer } from 'rxjs';
import { delayWhen, take } from 'rxjs/operators';

import { AnalyticActionEnum } from '@pe/checkout/analytics';
import { CompositeForm } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { RateUtilsService } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PatchFormState, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';

import {
  flowWithPaymentOptionsFixture,
  paymentOptionsFixture,
  paymentFormFixture,
  ratesFixture,
} from '../../../../../test/fixtures';
import {
  GetRatesParamsInterface,
  RatesCalculationApiService,
  RatesCalculationService,
} from '../../../../common';
import { ProtectionFormComponent } from '../../../income';

import { RateEditListComponent } from './rate-edit-list.component';

describe('RateEditListComponent', () => {

  let component: RateEditListComponent;
  let fixture: ComponentFixture<RateEditListComponent>;

  let store: Store;
  let ratesCalculationService: RatesCalculationService;
  let rateUtilsService: RateUtilsService<unknown>;
  let storage: PaymentInquiryStorage;
  let formGroup: InstanceType<typeof ProtectionFormComponent>['formGroup'];

  const expectedParams: GetRatesParamsInterface = {
    desiredInstalment: null,
    dayOfFirstInstalment: paymentFormFixture().detailsForm.dayOfFirstInstalment,
    condition: paymentFormFixture().detailsForm.condition,
    dateOfBirth: `fix_value${paymentFormFixture().detailsForm.customer.personalDateOfBirth}`,
    profession: paymentFormFixture().detailsForm.customer.profession,
    downPayment: paymentFormFixture().detailsForm.downPayment,
    weekOfDelivery: paymentFormFixture().detailsForm.weekOfDelivery,
    amount: flowWithPaymentOptionsFixture().total,
    cpi: false,
  };

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(),
        { provide: NgControl, useValue: formControl },
        RateUtilsService,
        PaymentInquiryStorage,
        RatesCalculationService,
        RatesCalculationApiService,
        PeCurrencyPipe,
        {
          provide: LocaleConstantsService,
          useValue: {
            getLang: jest.fn().mockReturnValue('en-GB'),
          },
        },
      ],
      declarations: [
        RateEditListComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    registerLocaleData(de.default);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(RateEditListComponent);
    component = fixture.componentInstance;

    jest.spyOn(component['dateUtilService'], 'fixDate')
      .mockImplementation(value => `fix_value${value}`);

    ratesCalculationService = TestBed.inject(RatesCalculationService);
    rateUtilsService = TestBed.inject(RateUtilsService);
    storage = TestBed.inject(PaymentInquiryStorage);

    formGroup = component.formGroup;

  });

  afterEach(() => {

    jest.clearAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('creditDurationInMonths')).toBeTruthy();
    expect(formGroup.get('creditDurationInMonths').value).toBeNull();
    expect(formGroup.get('creditDurationInMonths').validator).toBeTruthy();

    expect(formGroup.get('_rate')).toBeTruthy();
    expect(formGroup.get('_rate').value).toBeNull();
    expect(formGroup.get('_rate').validator).toBeFalsy();

    expect(formGroup.get('desiredInstalment')).toBeTruthy();
    expect(formGroup.get('desiredInstalment').value).toBeNull();
    expect(formGroup.get('desiredInstalment').disabled).toBeTruthy();
    expect(formGroup.get('desiredInstalment').validator).toBeTruthy();

    expect(formGroup.get('_desiredInstalmentView')).toBeTruthy();
    expect(formGroup.get('_desiredInstalmentView').value).toBeNull();
    expect(formGroup.get('_desiredInstalmentView').disabled).toBeTruthy();
    expect(formGroup.get('_desiredInstalmentView').validator).toBeTruthy();

  });

  it('should enforce max validator to the form fields', () => {

    const desiredInstalment = formGroup.get('desiredInstalment');
    desiredInstalment.enable();
    const desiredInstalmentView = formGroup.get('_desiredInstalmentView');
    desiredInstalmentView.enable();

    expect(desiredInstalment.valid).toBeTruthy();
    expect(desiredInstalmentView.valid).toBeTruthy();

    desiredInstalment.setValue(flowWithPaymentOptionsFixture().total + 1);
    desiredInstalmentView.setValue(flowWithPaymentOptionsFixture().total + 2);
    expect(desiredInstalment.valid).toBeFalsy();
    expect(desiredInstalmentView.valid).toBeFalsy();

    desiredInstalment.setValue(flowWithPaymentOptionsFixture().total - 2);
    desiredInstalmentView.setValue(flowWithPaymentOptionsFixture().total - 2);
    expect(desiredInstalment.valid).toBeTruthy();
    expect(desiredInstalmentView.valid).toBeTruthy();

  });

  it('should enforce form validator if desiredInstalment and _desiredInstalmentView not the same', () => {

    const desiredInstalment = formGroup.get('desiredInstalment');
    desiredInstalment.enable();
    const desiredInstalmentView = formGroup.get('_desiredInstalmentView');
    desiredInstalmentView.enable();

    expect(formGroup.errors).toBeNull();

    desiredInstalment.setValue(null);
    desiredInstalmentView.setValue(null);

    expect(formGroup.errors).toBeNull();

    desiredInstalment.setValue(300);
    desiredInstalmentView.setValue(350);

    expect(formGroup.errors).not.toBeNull();

    desiredInstalment.setValue(400);
    desiredInstalmentView.setValue(400);

    expect(formGroup.errors).toBeNull();

  });

  describe('ratesForm', () => {
    it('should get ratesForm return rates form from state', () => {
      expect(component.ratesForm).toEqual(paymentFormFixture().ratesForm);
    });
    it('should return empty object', fakeAsync(() => {
      store.dispatch(new PatchFormState({
        ratesForm: null,
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(RateEditListComponent);
      component = fixture.componentInstance;
      expect(component.ratesForm).toEqual({});
    }));
  });

  describe('params', () => {
    it('should correct get params', (done) => {
      component['params$'].subscribe((params) => {
        expect(params).toMatchObject(expectedParams);
        done();
      });
    });
    it('should params$ handle dateOfBirth', (done) => {
      const detailsForm = store.selectSnapshot(PaymentState.form).detailsForm;
      store.dispatch(new PatchFormState({
        detailsForm: {
          ...detailsForm,
          customer: {
            ...detailsForm.customer,
            personalDateOfBirth: undefined,
          },
        },
      }));
      component['params$'].subscribe((params) => {
        expect(params).toMatchObject({
          ...expectedParams,
          dateOfBirth: null,
        });
        done();
      });
    });
  });

  describe('rates$', () => {
    it('should update rates if params trigger', (done) => {
      const fetchRates = jest.spyOn(ratesCalculationService, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));
      const selectRateOnInit = jest.spyOn((component as any), 'selectRateOnInit');
      const ratesFilter = jest.spyOn(rateUtilsService, 'ratesFilter');

      component.extraDuration = null;
      component.rates$.subscribe(((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(fetchRates).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, expectedParams);
        expect(ratesFilter).not.toHaveBeenCalled();
        expect(selectRateOnInit).toHaveBeenCalledWith(ratesFixture());

        done();
      }));
    });

    it('should update rates if params trigger with extra duration', (done) => {
      const fetchRates = jest.spyOn(ratesCalculationService, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));
      const selectRateOnInit = jest.spyOn((component as any), 'selectRateOnInit');
      const ratesFilter = jest.spyOn(rateUtilsService, 'ratesFilter')
        .mockReturnValue(ratesFixture());

      component.extraDuration = 10;
      component.rates$.subscribe(((rates) => {
        expect(rates).toEqual(ratesFixture());
        expect(fetchRates).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, expectedParams);
        expect(ratesFilter).toHaveBeenCalledWith(ratesFixture(), 'duration', 10);
        expect(selectRateOnInit).toHaveBeenCalledWith(ratesFixture());

        done();
      }));
    });

    it('should update handle error', (done) => {
      jest.spyOn(ratesCalculationService, 'fetchRates')
        .mockReturnValue(throwError(new Error()));
      const selectedEmit = jest.spyOn(component.selected, 'emit');

      component.extraDuration = null;
      component.rates$.subscribe(((rates) => {
        expect(rates).toEqual([]);
        expect(selectedEmit).toHaveBeenCalledWith({ rate: null, data: {} });

        done();
      }));
    });
  });

  describe('loadingRates', () => {
    it('should handle loading true', (done) => {
      const loadingTrue = new Subject<any>();
      const loadingFalse = new Subject<any>();

      component['params$'] = loadingTrue;
      component.rates$ = loadingFalse;
      fixture.detectChanges();
      component.loadingRates$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        loadingFalse.next();
        done();
      });
      loadingTrue.next();
    });
  });

  describe('details$', () => {
    let mapToDetails: jest.SpyInstance;

    beforeEach(() => {
      mapToDetails = jest.spyOn(component as any, 'mapToDetails')
        .mockImplementation((rates, dayOfFirstInstalment) => ({ rates, dayOfFirstInstalment }));

      jest.spyOn(ratesCalculationService, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));
      component.extraDuration = null;
    });

    it('should handle details$', (done) => {
      component.details$.subscribe((details) => {
        expect(details).toEqual({
          rates: ratesFixture()[2],
          dayOfFirstInstalment: paymentFormFixture().detailsForm.dayOfFirstInstalment,
        });
        expect(mapToDetails).toHaveBeenCalledWith(
          ratesFixture()[2],
          paymentFormFixture().detailsForm.dayOfFirstInstalment,
        );
        done();
      });
      formGroup.get('creditDurationInMonths').setValue(ratesFixture()[2].duration);
    });

    it('should details$ handle if duration does not match', (done) => {
      component.details$.subscribe((details) => {
        expect(details).toEqual({
          rates: ratesFixture()[0],
          dayOfFirstInstalment: paymentFormFixture().detailsForm.dayOfFirstInstalment,
        });
        expect(mapToDetails).toHaveBeenCalledWith(
          ratesFixture()[0],
          paymentFormFixture().detailsForm.dayOfFirstInstalment,
        );
        done();
      });
      formGroup.get('creditDurationInMonths').setValue(10000);
    });
  });

  describe('showApply', () => {
    beforeEach(() => {
      jest.spyOn(ratesCalculationService, 'fetchRates')
        .mockReturnValue(of(ratesFixture()));
      jest.spyOn((component as any), 'selectRateOnInit');
      jest.spyOn(rateUtilsService, 'ratesFilter');
      component.extraDuration = null;
      component.formGroup.get('_desiredInstalmentView').enable();
      component.formGroup.get('desiredInstalment').enable();
    });
    it('should showApply$ return false', (done) => {
      component.showApply$
        .pipe(delayWhen(() => timer(1000)), take(1))
        .subscribe((value) => {
          expect(component.formGroup.get('_desiredInstalmentView').hasError('max')).toBeFalsy();
          expect(value).toBeFalsy();
          done();
        });
      component.formGroup.get('_desiredInstalmentView').patchValue(flowWithPaymentOptionsFixture().total - 100);
      component.formGroup.get('desiredInstalment').patchValue(flowWithPaymentOptionsFixture().total - 100);
    });
    it('should showApply$ return false if _desiredInstalmentView has Error', (done) => {
      component.showApply$
        .pipe(delayWhen(() => timer(1000)), take(1))
        .subscribe((value) => {
          expect(component.formGroup.get('_desiredInstalmentView').hasError('max')).toBeTruthy();
          expect(value).toBeFalsy();
          done();
        });
      component.formGroup.get('_desiredInstalmentView').patchValue(flowWithPaymentOptionsFixture().total + 100);
      component.formGroup.get('desiredInstalment').patchValue(flowWithPaymentOptionsFixture().total);
    });
  });

  it('should view rates transform rates', (done) => {

    jest.spyOn(ratesCalculationService, 'fetchRates')
      .mockReturnValue(of(ratesFixture()));
    const transformRate = jest.spyOn((component as any), 'transformRate')
      .mockImplementation(rate => rate);

    component.viewRates$.subscribe((viewRates) => {
      expect(viewRates).toEqual(ratesFixture());
      expect(transformRate).toHaveBeenCalledTimes(ratesFixture().length);

      done();
    });

  });


  describe('showDesiredInstalment$', () => {
    it('should showDesiredInstalment return true', (done) => {
      component.showDesiredInstalment$.subscribe((condition) => {
        expect(condition).toBeTruthy();
        done();
      });
    });
    it('should showDesiredInstalment return false', (done) => {
      store.dispatch(new PatchFormState({
        detailsForm: {
          ...store.selectSnapshot(PaymentState.form).detailsForm,
          _enableDesiredInstalment: null,
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(RateEditListComponent);
      component = fixture.componentInstance;

      component.showDesiredInstalment$.subscribe((condition) => {
        expect(condition).toBeFalsy();
        done();
      });
    });
  });

  it('should isComfortCardCondition return correct condition', (done) => {

    component.isComfortCardCondition$.subscribe((condition) => {
      expect(condition).toEqual(paymentOptionsFixture().conditions[0]);

      done();
    });

  });

  it('should call showDesiredInstallment on init', () => {

    const showDesiredInstallment = jest.spyOn(component, 'showDesiredInstallment');

    expect(paymentFormFixture().ratesForm.desiredInstalment).not.toBeNull();
    component.ngOnInit();
    expect(showDesiredInstallment).toHaveBeenCalled();

  });

  it('should ngAfterViewInit call showDesiredInstallment', () => {

    const desiredInstalmentView = formGroup.get('_desiredInstalmentView');
    const showDesiredInstallment = jest.spyOn(component, 'showDesiredInstallment');

    component.ngAfterViewInit();
    expect(desiredInstalmentView.value).toBeNull();
    expect(showDesiredInstallment).not.toHaveBeenCalled();

    desiredInstalmentView.setValue(12);
    component.ngAfterViewInit();
    expect(desiredInstalmentView.value).not.toBeNull();
    expect(showDesiredInstallment).toHaveBeenCalled();

  });

  it('should correct transform rate id', () => {

    expect(component['makeRateId'](null)).toBeNull();
    expect(component['makeRateId'](ratesFixture()[0])).toEqual(ratesFixture()[0].duration.toString());

  });

  it('should successfully init select rate', () => {

    const rateSelected = jest.spyOn(component, 'rateSelected');
    const creditDurationInMonths = formGroup.get('creditDurationInMonths').value;

    component['selectRateOnInit'](ratesFixture());

    expect(creditDurationInMonths).toBeNull();
    expect(rateSelected).toHaveBeenCalledWith(ratesFixture()[0].duration.toString(), ratesFixture());

  });

  it('should successfully select rate', () => {

    const selectEmit = jest.spyOn(component.selected, 'emit');
    const emitEventForm = jest.spyOn(component['analyticsFormService'], 'emitEventForm');

    component.rateSelected(ratesFixture()[0].duration.toString(), ratesFixture());

    expect(selectEmit).toHaveBeenCalledWith({
      rate: ratesFixture()[0],
      data: {
        creditDurationInMonths: ratesFixture()[0]?.duration,
      },
    });
    expect(formGroup.get('creditDurationInMonths').value).toEqual(ratesFixture()[0].duration);
    expect(formGroup.get('_rate').value).toEqual(ratesFixture()[0]);
    expect(emitEventForm).toHaveBeenCalledWith('FORM_RATE_SELECT', {
      field: 'Choose rate',
      action: AnalyticActionEnum.CHANGE,
    });

  });

  it('should toggle rates in storage ', () => {

    const getExtraDurations = jest.spyOn(storage, 'getExtraDurations')
      .mockReturnValue([10, 11]);
    const setExtraDurations = jest.spyOn(storage, 'setExtraDurations')
      .mockReturnValue(null);

    const duration = 12;

    component.toggleRatesInStorage({ duration, checked: true });
    expect(getExtraDurations).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id);
    expect(setExtraDurations).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, [10, 11, duration]);

    component.toggleRatesInStorage({ duration, checked: false });
    expect(getExtraDurations).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id);
    expect(setExtraDurations).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, [10, 11]);

  });

  it('should correct apply desired installment', () => {

    formGroup.get('_desiredInstalmentView').setValue(100);

    expect(formGroup.get('desiredInstalment').value).toBeNull();
    component['applyDesiredInstallment']();
    expect(formGroup.get('desiredInstalment').value).toEqual(100);

  });

  it('should correct enable when calling showDesiredInstallment', () => {

    expect(formGroup.get('_desiredInstalmentView').enabled).toBeFalsy();
    expect(formGroup.get('desiredInstalment').enabled).toBeFalsy();

    component['showDesiredInstallment']();

    expect(formGroup.get('_desiredInstalmentView').enabled).toBeTruthy();
    expect(formGroup.get('desiredInstalment').enabled).toBeTruthy();

  });

  describe('mapToDetails', () => {
    it('should correct transform in map to details rates', () => {

      const percentPipe = jest.spyOn(component['percentPipe'], 'transform');
      const currencyPipe = jest.spyOn(component['currencyPipe'], 'transform');
      const firstRateOn = jest.spyOn((component as any), 'firstRateOn');

      formGroup.get('desiredInstalment').setValue(10);

      component['mapToDetails'](ratesFixture()[0], 12);

      expect(percentPipe)
        .toHaveBeenNthCalledWith(1, ratesFixture()[0].interestRate / 100, '1.0-2');
      expect(percentPipe)
        .toHaveBeenNthCalledWith(2, ratesFixture()[0].annualPercentageRate / 100, '1.0-2');
      expect(currencyPipe)
        .toHaveBeenNthCalledWith(1, ratesFixture()[0].interest, flowWithPaymentOptionsFixture().currency);
      expect(currencyPipe)
        .toHaveBeenNthCalledWith(2, ratesFixture()[0].totalCreditCost + 10, flowWithPaymentOptionsFixture().currency);
      expect(firstRateOn)
        .toHaveBeenCalledWith(new Date(ratesFixture()[0].dateOfFirstInstalment).toISOString(), 12);

    });

    it('should mapToDetails handle null rate', () => {
      const expectedResult = Array(5).fill({
          title: expect.any(String),
          value: null,
        });
      expect(component['mapToDetails'](null, 12)).toEqual(expectedResult);
    });
  });


  it('should return correct firstRateOn', () => {

    expect(component['firstRateOn']('12/04/2023', 12)).toEqual('12/12/2023');
    expect(component['firstRateOn']('12/04/2023', 1)).toEqual('01/01/2024');

  });

  it('should correct transform rate', () => {

    const rate = ratesFixture()[0];
    const transformPrice = `$${rate.monthlyPayment}`;
    const makeRateId = jest.spyOn(component, 'makeRateId');
    const currencyPipe = jest.spyOn(component['currencyPipe'], 'transform')
      .mockReturnValue(transformPrice);


    expect(component['transformRate'](rate)).toMatchObject({
      id: String(rate.duration),
      title: $localize`:@@payment-santander-de-pos.creditRates.rateTitle:
        ${transformPrice}:subsequentInstalment:
        ${rate.duration}:duration:`,
    });
    expect(makeRateId).toHaveBeenCalledWith(rate);
    expect(currencyPipe)
      .toHaveBeenCalledWith(rate.monthlyPayment, flowWithPaymentOptionsFixture().currency, 'symbol');

  });

});
