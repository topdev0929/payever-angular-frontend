import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  RatesCalculationService,
  SantanderDkFlowService, SharedModule,
} from '../../../shared';
import { flowWithPaymentOptionsFixture, productsFixture, ratesFixture } from '../../../test';

import { RatesInfoTableComponent } from './rates-info-table.component';

describe('RatesInfoTableComponent', () => {

  let component: RatesInfoTableComponent;
  let fixture: ComponentFixture<RatesInfoTableComponent>;

  let store: Store;
  let flowService: SantanderDkFlowService;
  let ratesCalculationService: RatesCalculationService;

  const initialData = {
    productId: 'prod-001',
    _isSafeInsuranceAllowed: false,
    monthlyAmount: 100,
    totalCreditAmount: 1300,
    creditDurationInMonths: 13,
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [RatesInfoTableComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    flowService = TestBed.inject(SantanderDkFlowService);
    ratesCalculationService = TestBed.inject(RatesCalculationService);

    jest.spyOn(flowService, 'getCreditProducts').mockReturnValue(of(productsFixture()));

    fixture = TestBed.createComponent(RatesInfoTableComponent);
    component = fixture.componentInstance;

    component.flowId = flowWithPaymentOptionsFixture().id;
    component.paymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK;
    component.initialData = initialData;

    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should call fetchProducts on init', () => {

    const fetchProductsSpy = jest.spyOn(component as any, 'fetchProducts');

    component.ngOnInit();

    expect(fetchProductsSpy).toHaveBeenCalled();

  });

  it('should call getProducts if total and currency are set', () => {

    const getProductsSpy = jest.spyOn(component['productsCalculationService'], 'getProducts');

    component.total = null;
    component.currency = null;

    component.fetchProducts();

    expect(getProductsSpy).not.toHaveBeenCalled();

    component.total = 1000;
    component.currency = null;

    component.fetchProducts();

    expect(getProductsSpy).not.toHaveBeenCalled();

    component.total = null;
    component.currency = 'EUR';

    component.fetchProducts();

    expect(getProductsSpy).not.toHaveBeenCalled();

    component.total = 1000;
    component.currency = 'EUR';

    component.fetchProducts();

    expect(component.total).not.toBeNull();
    expect(component.currency).not.toBeNull();
    expect(getProductsSpy).toHaveBeenCalled();

  });


  it('should be null when productsCalculationService.getProducts return empty array', () => {

    const getProductByFormDataSpy = jest.spyOn(component as any, 'getProductByFormData');
    const getRateByFormDataSpy = jest.spyOn(component as any, 'getRateByFormData');
    const getProductsSpy = jest.spyOn(component['productsCalculationService'], 'getProducts')
      .mockReturnValue(of([]));
    const getRates = jest.spyOn(ratesCalculationService, 'getRates');

    component.total = 13000;
    component.currency = 'USD';
    component.selectedProduct = null;

    component.fetchProducts();

    expect(component.total).not.toBeNull();
    expect(component.currency).not.toBeNull();
    expect(getProductsSpy).toHaveBeenCalled();
    expect(getProductByFormDataSpy).toHaveBeenCalled();
    expect(getRates).not.toHaveBeenCalled();
    expect(getRateByFormDataSpy).not.toHaveBeenCalled();
    expect(component.selectedProduct).toBeUndefined();
    expect(component.selectedRate$.getValue()).toBeNull();

  });

  it('should be null if getProductByFormData returns null', () => {

    const getProductByFormDataSpy = jest.spyOn(component as any, 'getProductByFormData').mockReturnValue(null);
    const getRateByFormDataSpy = jest.spyOn(component as any, 'getRateByFormData');
    const getProductsSpy = jest.spyOn(component['productsCalculationService'], 'getProducts')
      .mockImplementation(() => of([]));
    const getRates = jest.spyOn(ratesCalculationService, 'getRates');

    component.total = 13000;
    component.currency = 'USD';
    component.selectedProduct = null;

    component.fetchProducts();

    expect(component.total).not.toBeNull();
    expect(component.currency).not.toBeNull();
    expect(getProductsSpy).toHaveBeenCalled();
    expect(getProductByFormDataSpy).toHaveBeenCalled();
    expect(getRates).not.toHaveBeenCalled();
    expect(getRateByFormDataSpy).not.toHaveBeenCalled();
    expect(component.selectedProduct).toBeNull();
    expect(component.selectedRate$.getValue()).toBeNull();

  });

  it('should correct set selectedRate$', () => {

    const getProductsSpy = jest.spyOn(component['productsCalculationService'], 'getProducts')
      .mockReturnValue(of(productsFixture()));
    const getProductByFormDataSpy = jest.spyOn(component as any, 'getProductByFormData')
      .mockReturnValue(productsFixture()[0]);

    const getRatesSpy = jest.spyOn(component['ratesCalculationService'], 'getRates')
      .mockReturnValue(of(ratesFixture()));
    const getRateByFormDataSpy = jest.spyOn(component as any, 'getRateByFormData')
      .mockReturnValue(ratesFixture());

    component.total = 1000;
    component.currency = 'USD';
    component.selectedProduct = null;

    component.fetchProducts();

    expect(component.total).not.toBeNull();
    expect(component.currency).not.toBeNull();
    expect(getProductsSpy).toHaveBeenCalled();

    expect(getProductByFormDataSpy).toHaveBeenCalledWith(initialData, productsFixture());
    expect(getRatesSpy).toHaveBeenCalledWith(productsFixture()[0].id.toString());

    expect(getRateByFormDataSpy).toHaveBeenCalledWith(initialData, ratesFixture());
    expect(component.selectedRate$.getValue()).toEqual(ratesFixture());

  });


  it('should return loan duration in months when payLaterType is false', () => {

    expect(component.getPaymentPeriod(ratesFixture()[0])).toEqual(ratesFixture()[0].parameters.loanDurationInMonths);

  });

  it('should return sum of loan duration and payment free duration when payLaterType is true', () => {

    expect(component.getPaymentPeriod(ratesFixture()[2])).toEqual(
      ratesFixture()[2].parameters.loanDurationInMonths + ratesFixture()[2].result.paymentFreeDuration,
    );

  });


  it('should find and return the correct product based on form data', () => {

    const initialData = { productId: '1', _isSafeInsuranceAllowed: true };
    const products = [{ id: '1', isSafeInsuranceAllowed: true }, { id: '2', isSafeInsuranceAllowed: false }];
    const expectedProduct = products[0];

    expect((component as any).getProductByFormData(initialData, products as any)).toEqual(expectedProduct);

  });

  it('should return undefined if no product matches', () => {

    const initialData = { productId: '3', _isSafeInsuranceAllowed: false };
    const products = [{ id: '1', isSafeInsuranceAllowed: true }, { id: '2', isSafeInsuranceAllowed: false }];

    expect((component as any).getProductByFormData(initialData, products as any)).toBeUndefined();

  });


  it('should find and return the correct rate based on form data', () => {

    const initialData = { monthlyAmount: '100', totalCreditAmount: '500', creditDurationInMonths: '12' };
    const rates = [
      { result: { monthlyPayment: '100', totalLoanAmount: '500' }, parameters: { loanDurationInMonths: 12 } },
      { result: { monthlyPayment: '200', totalLoanAmount: '1000' }, parameters: { loanDurationInMonths: 24 } },
    ];
    const expectedRate = rates[0];

    expect((component as any).getRateByFormData(initialData, rates)).toEqual(expectedRate);

  });

  it('should return undefined if no rate matches', () => {

    const initialData = { monthlyAmount: '300', totalCreditAmount: '1500', creditDurationInMonths: '18' };
    const rates = [
      { result: { monthlyPayment: '100', totalLoanAmount: '500' }, parameters: { loanDurationInMonths: 12 } },
      { result: { monthlyPayment: '200', totalLoanAmount: '1000' }, parameters: { loanDurationInMonths: 24 } },
    ];

    expect((component as any).getRateByFormData(initialData, rates)).toBeUndefined();

  });

});
