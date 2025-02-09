import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { first } from 'rxjs/operators';

import { RateUtilsService } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { FlowExtraDurationType, PaymentMethodEnum } from '@pe/checkout/types';

import { ratesFixture } from '../../../test';
import { SantanderUkRatesModule } from '../../santander-uk-rates.module';
import { RatesCalculationService } from '../../services';

import { RatesEditListComponent } from './rates-edit-list.component';

describe('RatesEditListComponent', () => {

  let component: RatesEditListComponent;
  let fixture: ComponentFixture<RatesEditListComponent>;

  let rateUtilsService: RateUtilsService<unknown>;
  let ratesCalculationService: RatesCalculationService;

  const defaultTotal = 50;
  const defaultCurrency = 'USD';
  const defaultDeposit = 100;
  const mockExtraDuration: FlowExtraDurationType = 10;
  const mockFlowId = 'flow-id';
  const mockPaymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_UK;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [RatesEditListComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SantanderUkRatesModule),
        PaymentInquiryStorage,
        RateUtilsService,
        RatesCalculationService,
      ],
      schemas: [],
    }).compileComponents();

    rateUtilsService = TestBed.inject(RateUtilsService);
    ratesCalculationService = TestBed.inject(RatesCalculationService);

    ratesCalculationService.isLoading$ = of(null) as any;

    fixture = TestBed.createComponent(RatesEditListComponent);
    component = fixture.componentInstance;

    component.total = defaultTotal;
    component.deposit = defaultDeposit;
    component.currency = defaultCurrency;
    component.flowId = mockFlowId;
    component.paymentMethod = mockPaymentMethod;
    component.extraDuration = mockExtraDuration;

    fixture.detectChanges();
  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should trigger rateSelected trigger selectRateSubject$ with new id', (done) => {
    component.selected.pipe(first()).subscribe((value) => {
      expect(value).toEqual({
        rate: component.selectedRate,
        data: {
          duration: component.selectedRate?.duration,
          interestRate: component.selectedRate?.interestRate,
          flatRate: component.selectedRate?.specificData?.flatRate,
          monthlyPayment: component.selectedRate?.monthlyPayment,
          firstMonthPayment: component.selectedRate?.specificData?.firstMonthPayment,
          lastMonthPayment: component.selectedRate?.lastMonthPayment,
          interest: component.selectedRate?.interest,
          totalCreditCost: component.selectedRate?.totalCreditCost,
        },
      });
      done();
    });
    component['selectRateSubject$'].next('24');
  });

  it('should trigger rate fetching when total changes', () => {

    const fetchRatesSubjectNextSpy = jest.spyOn((component as any).fetchRatesSubject$, 'next');
    component.total = 100;
    expect(fetchRatesSubjectNextSpy).toHaveBeenCalled();

  });

  it('should trigger rate fetching when deposit changes', () => {

    const fetchRatesSubjectNextSpy = jest.spyOn((component as any).fetchRatesSubject$, 'next');
    component.deposit = 50;
    expect(fetchRatesSubjectNextSpy).toHaveBeenCalled();

  });

  it('should trigger rate fetching when currency changes', () => {

    const fetchRatesSubjectNextSpy = jest.spyOn((component as any).fetchRatesSubject$, 'next');
    component.currency = 'EUR';
    expect(fetchRatesSubjectNextSpy).toHaveBeenCalled();

  });

  it('should fetchRates$ update rates correctly', (done) => {

    const fetchRatesOnceSpy = jest.spyOn(ratesCalculationService, 'fetchRatesOnce')
      .mockReturnValue(of(ratesFixture()));
    const ratesFilterSpy = jest.spyOn(rateUtilsService, 'ratesFilter')
      .mockReturnValue(ratesFixture());
    const selectRateOnInitSpy = jest.spyOn((component as any), 'selectRateOnInit');
    const ratesLoadedEmitSpy = jest.spyOn(component.ratesLoaded, 'emit');

    component['fetchRatesSubject$'].next();

    component['fetchRates$'].subscribe((rates) => {
      expect(rates).toEqual(ratesFixture());
      expect(fetchRatesOnceSpy).toHaveBeenCalledWith(mockFlowId, mockPaymentMethod, defaultTotal, defaultDeposit);
      expect(ratesFilterSpy).toHaveBeenCalledWith(ratesFixture(), 'duration', mockExtraDuration);
      expect(selectRateOnInitSpy).toHaveBeenCalledWith(ratesFixture());
      expect(ratesLoadedEmitSpy).toHaveBeenCalled();

      done();
    });

  });

  it('should fetchRates$ handle error', (done) => {

    const error = new Error();

    const fetchRatesOnceSpy = jest.spyOn(ratesCalculationService, 'fetchRatesOnce')
      .mockReturnValue(throwError(error));

    const ratesFilterSpy = jest.spyOn(rateUtilsService, 'ratesFilter');
    const selectRateOnInitSpy = jest.spyOn((component as any), 'selectRateOnInit');
    const ratesLoadedEmitSpy = jest.spyOn(component.ratesLoaded, 'emit');
    const hasFetchErrorNextSpy = jest.spyOn(component.hasFetchError, 'next');

    fixture.detectChanges();
    component['fetchRatesSubject$'].next();

    component['fetchRates$'].subscribe({
      next: () => {
        expect(fetchRatesOnceSpy).toHaveBeenCalledWith(mockFlowId, mockPaymentMethod, defaultTotal, defaultDeposit);
        expect(hasFetchErrorNextSpy).toHaveBeenCalledWith(true);
        expect(ratesLoadedEmitSpy).toHaveBeenCalled();
        expect(ratesFilterSpy).toHaveBeenCalled();
        expect(selectRateOnInitSpy).toHaveBeenCalled();

        done();
      },
    });

  });

  it('should makeRateId correct string duration of rate', () => {

    expect(component.makeRateId(ratesFixture()[0])).toEqual(ratesFixture()[0].duration.toString());

  });

  it('should selectRateOnInit trigger doSelectRate$ correctly', () => {

    const doSelectRateSpy = jest.spyOn(component.doSelectRate$, 'next');
    const rateSelectedSpy = jest.spyOn(component, 'rateSelected');

    component['selectRateOnInit']([]);
    expect(doSelectRateSpy).not.toHaveBeenCalled();
    expect(rateSelectedSpy).toHaveBeenCalledWith(null);

    jest.clearAllMocks();
    fixture.detectChanges();

    component.selectedRate = ratesFixture()[0];
    component['selectRateOnInit'](ratesFixture());

    expect(doSelectRateSpy).toHaveBeenCalledWith(component.makeRateId(ratesFixture()[0]));

    jest.clearAllMocks();
    fixture.detectChanges();

    component.initialData = ratesFixture()[0];
    component.selectedRate = null;
    component['selectRateOnInit'](ratesFixture());

    expect(doSelectRateSpy).toHaveBeenCalledWith(component.makeRateId(ratesFixture()[0]));
    expect(component.selectedRate).toEqual(ratesFixture()[0]);

    jest.clearAllMocks();
    fixture.detectChanges();

    component.initialData = null;
    component.selectedRate = null;
    component['selectRateOnInit']([ratesFixture()[0]]);

    expect(doSelectRateSpy).toHaveBeenCalledWith(component.makeRateId(ratesFixture()[0]));
    expect(component.selectedRate).toEqual(ratesFixture()[0]);

  });

  it('should transformRate call pipe with correct values', () => {

    const currencyPipeSpy = jest.spyOn(component['currencyPipe'], 'transform');
    const percentPipeSpy = jest.spyOn(component['percentPipe'], 'transform');

    component['transformRate'](ratesFixture()[0]);

    expect(currencyPipeSpy).toHaveBeenCalledWith(ratesFixture()[0].monthlyPayment, defaultCurrency, 'symbol');
    expect(percentPipeSpy).toHaveBeenCalledWith(ratesFixture()[0].annualPercentageRate * 0.01, '1.0-2');
    expect(currencyPipeSpy).toHaveBeenCalledWith(ratesFixture()[0].monthlyPayment, defaultCurrency, 'symbol');
    expect(percentPipeSpy).toHaveBeenCalledWith(ratesFixture()[0].annualPercentageRate * 0.01, '1.0-2');

  });

  it('should trigger rateSelected trigger selectRateSubject$ with new id', () => {

    const selectRateSubjectNextSpy = jest.spyOn((component as any).selectRateSubject$, 'next');

    component.rateSelected('1');

    expect(selectRateSubjectNextSpy).toHaveBeenCalledWith('1');

  });

  it('should emit correct ViewModel through vm$', (done) => {

    jest.spyOn(ratesCalculationService, 'fetchRatesOnce').mockReturnValue(of(ratesFixture()));
    jest.spyOn(rateUtilsService, 'ratesFilter').mockReturnValue(ratesFixture());

    fixture.detectChanges();
    component['fetchRatesSubject$'].next();

    component.vm$.pipe(first()).subscribe({
      next: (vm) => {
        expect(vm.rates).toEqual(ratesFixture().map((rate: any) => component['transformRate'](rate)));

        done();
      },
    });

  });

});
