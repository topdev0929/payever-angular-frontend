import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  ProductsCalculationService,
  RatesCalculationService,
  RatesFormValue,
  SharedModule,
} from '../../../shared';
import { flowWithPaymentOptionsFixture, productsFixture, ratesFixture } from '../../../test';
import { getPaymentPeriod } from '../../utils';

import { RatesEditListComponent } from './rates-edit-list.component';

jest.mock('../../utils', () => ({
  getPaymentPeriod: jest.fn(),
}));

describe('RatesEditListComponent', () => {

  let component: RatesEditListComponent;
  let fixture: ComponentFixture<RatesEditListComponent>;

  let ratesCalculationService: RatesCalculationService;
  let productsCalculationService: ProductsCalculationService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [RatesEditListComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [],
    }).compileComponents();

    ratesCalculationService = TestBed.inject(RatesCalculationService);
    productsCalculationService = TestBed.inject(ProductsCalculationService);

    fixture = TestBed.createComponent(RatesEditListComponent);
    component = fixture.componentInstance;

    component.flowId = 'flow-id';
    component.paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_DK;
    component.connectionId = 'connection-id';
    component.currency = 'EUR';
    component.total = 10;

    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should successfully make fetchProducts', (done) => {

    const fetchingRatesEmitSpy = jest.spyOn(component.fetchingRates, 'emit');
    const getProductsSpy = jest.spyOn(productsCalculationService, 'getProducts')
      .mockReturnValue(of(productsFixture()));

    component.ngOnInit();

    component.fetchProducts();

    component['products$'].subscribe(() => {

      expect(fetchingRatesEmitSpy).toHaveBeenCalledTimes(4);
      expect(getProductsSpy).toHaveBeenCalled();
      expect(component.productsLoadError).toBeNull();
      done();

    });

  });

  it('should call transformProduct after success fetchProducts', (done) => {

    jest.spyOn(component.fetchingRates, 'emit');
    jest.spyOn(productsCalculationService, 'getProducts')
      .mockReturnValue(of(productsFixture()));
    const transformProductSpy = jest.spyOn(component as any, 'transformProduct');

    component.ngOnInit();

    component.fetchProducts();

    component.vm$.subscribe(() => {

      expect(transformProductSpy).toHaveBeenCalledTimes(1);
      expect(transformProductSpy).toHaveBeenCalledWith(productsFixture()[0]);
      done();

    });

  });

  it('should handle fetchProducts error', (done) => {

    const fetchingRatesEmitSpy = jest.spyOn(component.fetchingRates, 'emit');

    const error = new Error('Network Error');

    const getProductsSpy = jest.spyOn(productsCalculationService, 'getProducts')
      .mockReturnValue(throwError(error));

    component.ngOnInit();

    component.fetchProducts();

    component['products$'].subscribe(() => {

      expect(fetchingRatesEmitSpy).toHaveBeenCalledTimes(4);
      expect(getProductsSpy).toHaveBeenCalled();
      expect(component.productsLoadError).toEqual(error.message);
      done();

    });

  });

  it('should not call transformProduct after failed fetchProducts', (done) => {

    jest.spyOn(component.fetchingRates, 'emit');
    const error = new Error('Network Error');
    jest.spyOn(productsCalculationService, 'getProducts')
      .mockReturnValue(throwError(error));
    const transformProductSpy = jest.spyOn(component as any, 'transformProduct').mockReturnValue(true);

    component.ngOnInit();

    component.fetchProducts();

    component.vm$.subscribe(() => {

      expect(transformProductSpy).toHaveBeenCalledTimes(0);
      expect(transformProductSpy).not.toHaveBeenCalledWith(productsFixture()[0]);
      done();

    });

  });

  it('should successfully make fetchRates', (done) => {

    const fetchingRatesEmitSpy = jest.spyOn(component.fetchingRates, 'emit');
    jest.spyOn(productsCalculationService, 'getProducts')
      .mockReturnValue(of(productsFixture()));
    const getRatesSpy = jest.spyOn(ratesCalculationService, 'getRates')
      .mockReturnValue(of(ratesFixture()));

    component.ngOnInit();

    component.fetchRates();

    component['rates$'].subscribe(() => {
      expect(fetchingRatesEmitSpy).toHaveBeenCalledTimes(3);
      expect(getRatesSpy).toHaveBeenCalledTimes(1);
      expect(getRatesSpy).toHaveBeenCalledWith(String(productsFixture()[0].id));
      expect(component.ratesLoadError).toBeNull();
      done();
    });
    component['fetchRatesSubject$'].next();

  });

  it('should handle fetchRates error', (done) => {

    const error = new Error('Network Error');

    const fetchingRatesEmitSpy = jest.spyOn(component.fetchingRates, 'emit');
    jest.spyOn(productsCalculationService, 'getProducts')
      .mockReturnValue(of(productsFixture()));
    const getProductsSpy = jest.spyOn(ratesCalculationService, 'getRates')
      .mockReturnValue(throwError(error));

    component.ngOnInit();

    component.fetchRates();

    component['rates$'].subscribe(() => {

      expect(fetchingRatesEmitSpy).toHaveBeenCalledTimes(3);
      expect(getProductsSpy).toHaveBeenCalled();
      expect(getProductsSpy).toHaveBeenCalledWith(String(productsFixture()[0].id));
      expect(component.ratesLoadError).toEqual(error.message);
      done();

    });

  });

  it('should not call transformRate after failed fetchRates', (done) => {

    const error = new Error('Network Error');

    jest.spyOn(component.fetchingRates, 'emit');
    jest.spyOn(productsCalculationService, 'getProducts')
      .mockReturnValue(of(productsFixture()));
    jest.spyOn(ratesCalculationService, 'getRates')
      .mockReturnValue(throwError(error));
    jest.spyOn(component as any, 'transformProduct');
    const transformRateSpy = jest.spyOn(component as any, 'transformRate');

    component.ngOnInit();

    component.fetchRates();

    component.vm$.pipe(take(1)).subscribe(() => {

      expect(transformRateSpy).toHaveBeenCalledTimes(0);
      expect(transformRateSpy).not.toHaveBeenCalledWith(ratesFixture()[0]);
      done();

    });

  });

  describe('makeRateId', () => {
    const paymentPeriod = 3;
    const rate = ratesFixture()[0];
    beforeEach(() => {
      (getPaymentPeriod as jest.Mock).mockReturnValue(paymentPeriod);
    });
    it('should handle provided rate', () => {
      expect(component.makeRateId(rate)).toEqual(`${paymentPeriod}_${rate.result.totalLoanAmount}`);
    });
    it('should return null', () => {
      expect(component.makeRateId(null)).toEqual(null);
    });
  });

  describe('selectRateOnInit', () => {
    const rates = ratesFixture();
    const paymentPeriod = 3;
    let doSelectRateNext: jest.SpyInstance;

    beforeEach(() => {
      doSelectRateNext = jest.spyOn(component.doSelectRate$, 'next');
      (getPaymentPeriod as jest.Mock).mockReturnValue(paymentPeriod);
    });

    it('should select rate from form data', () => {
      const rate = rates[1];
      const expectedRateId = component.makeRateId(rate);
      component['rateSelected'](expectedRateId, rates);
      const getRateByFormData = jest.spyOn(component as any, 'getRateByFormData');

      component['selectRateOnInit'](rates);
      expect(getRateByFormData).toHaveBeenCalledWith(component.formGroup.value, rates);
      expect(doSelectRateNext).toHaveBeenCalledWith(expectedRateId);
    });

    it('should select default rate', () => {
      const defaultRate = rates[0];
      const getRateByFormData = jest.spyOn(component as any, 'getRateByFormData')
        .mockReturnValue(null);

      component['selectRateOnInit'](rates);
      expect(getRateByFormData).toHaveBeenCalledWith(component.formGroup.value, rates);
      expect(doSelectRateNext).toHaveBeenCalledWith(component.makeRateId(defaultRate));
    });

    it('should set first rate', () => {
      jest.spyOn(component as any, 'getRateByFormData').mockImplementation(() => null);
      const firstRate = rates[1];
      component['selectRateOnInit']([firstRate]);
      expect(doSelectRateNext).toHaveBeenCalledWith(component.makeRateId(firstRate));
    });
  });

  describe('updateDetails', () => {
    let toPrice: jest.SpyInstance;
    let toPercent: jest.SpyInstance;

    beforeEach(() => {
      toPrice = jest.spyOn(component as any, 'toPrice')
        .mockImplementation(value => `$${value}`);
      toPercent = jest.spyOn(component as any, 'toPercent')
        .mockImplementation(value => `${value}%`);
    });

    it('should handle rate null', () => {
      component['updateDetails'](null);
      expect(toPrice).not.toHaveBeenCalled();
      expect(toPercent).not.toHaveBeenCalled();
      expect(component.details).toEqual([
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.annually_procent:`,
          value: null,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.effective_interest:`,
          value: null,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.total_cost:`,
          value: null,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.total_loan_amount:`,
          value: null,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.establishment_fee:`,
          value: null,
        },
      ]);
    });

    it('should perform correctly with interestFreeType', () => {
      const rate = {
        ...ratesFixture()[0],
        interestFreeType: true,
      };
      component['updateDetails'](rate);
      expect(toPrice).toHaveBeenCalledTimes(3);
      expect(toPercent).toHaveBeenCalledTimes(2);
      expect(component.details).toEqual([
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.annually_procent:`,
          value: `${rate.result.annuallyProcent}%`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.effective_interest:`,
          value: `${rate.parameters.effectiveInterest}%`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.total_cost:`,
          value: `$${rate.result.totalCost}`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.total_loan_amount:`,
          value: `$${rate.result.totalLoanAmount}`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.establishment_fee:`,
          value: `$${rate.parameters.establishmentFee}`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.interest_free_duration:`,
          value: $localize`:@@santander-dk.duration.count_months:${rate.result.paymentFreeDuration}:count:`,
        },
      ]);
    });

    it('should perform correctly without interestFreeType', () => {
      const rate = {
        ...ratesFixture()[0],
        interestFreeType: false,
      };
      component['updateDetails'](rate);
      expect(component.details).toEqual([
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.annually_procent:`,
          value: `${rate.result.annuallyProcent}%`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.effective_interest:`,
          value: `${rate.parameters.effectiveInterest}%`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.total_cost:`,
          value: `$${rate.result.totalCost}`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.total_loan_amount:`,
          value: `$${rate.result.totalLoanAmount}`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.establishment_fee:`,
          value: `$${rate.parameters.establishmentFee}`,
        },
        {
          title: $localize`:@@santander-dk.credit_rates.rate_param.payment_free_duration:`,
          value: $localize`:@@santander-dk.duration.count_months:${rate.result.paymentFreeDuration}:count:`,
        },
      ]);
    });
  });

  it('should correct update rate', () => {

    const expectedRate = ratesFixture()[0];
    const rateId = component.makeRateId(expectedRate);

    const selectedEmit = jest.spyOn(component.selected, 'emit');
    const updateDetails = jest.spyOn((component as any), 'updateDetails');

    component.rateSelected(rateId, ratesFixture());

    expect(component.formGroup.get('monthlyAmount').value).toEqual(expectedRate.result.monthlyPayment);
    expect(component.formGroup.get('totalCreditAmount').value).toEqual(expectedRate.result.totalLoanAmount);
    expect(component.formGroup.get('creditDurationInMonths').value).toEqual(getPaymentPeriod(expectedRate));
    expect(selectedEmit).toHaveBeenCalled();
    expect(updateDetails).toHaveBeenCalled();

  });

  it('should correct transform percent', () => {

    const value = 100;
    const expectedValue = (value: string | number) => `transform__${value}%`;
    const percentPipe = jest.spyOn(component['percentPipe'], 'transform')
      .mockImplementation(expectedValue);

    expect(component['toPercent'](value)).toEqual(expectedValue(value / 100));
    expect(percentPipe).toHaveBeenCalledWith(value / 100, '1.0-2');

  });

  it('should correct transform price', () => {

    const value = 100;
    const expectedValue = (value: string | number) => `transform__${value}$`;
    const currencyPipe = jest.spyOn(component['currencyPipe'], 'transform')
      .mockImplementation(expectedValue);

    expect(component['toPrice'](value)).toEqual(expectedValue(value));
    expect(currencyPipe).toHaveBeenCalledWith(
      value,
      flowWithPaymentOptionsFixture().currency,
      'symbol',
      (value % 1 === 0) ? '1.0-2' : '1.2-2',
    );

  });

  it('should correct get rate', () => {

    const initialData: RatesFormValue = {
      _isSafeInsuranceAllowed: false,
      productId: 'product-id',
      monthlyAmount: ratesFixture()[0].result.monthlyPayment,
      totalCreditAmount: ratesFixture()[0].result.totalLoanAmount,
      creditDurationInMonths: getPaymentPeriod(ratesFixture()[0]),
    };

    expect(component['getRateByFormData'](initialData, ratesFixture())).toEqual(ratesFixture()[0]);

  });

});
