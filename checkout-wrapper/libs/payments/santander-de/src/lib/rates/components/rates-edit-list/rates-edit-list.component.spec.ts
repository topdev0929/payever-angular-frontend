import { OverlayModule } from '@angular/cdk/overlay';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AnalyticFormStatusEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import {
  ChooseRateComponent,
  KitChooseRateComponent,
  KitRateViewComponent,
  SantanderDeSelectedRateDetailsComponent,
} from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PeCurrencyPipe } from '@pe/checkout/utils';

import { RateInterface } from '../../../shared/types';
import { rateFixture, ratesFixture } from '../../../test';

import { RatesEditListComponent } from './rates-edit-list.component';

describe('RatesEditListComponent', () => {
  let component: RatesEditListComponent;
  let fixture: ComponentFixture<RatesEditListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        OverlayModule,
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        CurrencyPipe,
        PeCurrencyPipe,
        PercentPipe,
        { provide: PaymentInquiryStorage, useValue: {} },
      ],
      declarations: [
        SantanderDeSelectedRateDetailsComponent,
        KitRateViewComponent,
        KitChooseRateComponent,
        ChooseRateComponent,
        RatesEditListComponent,
      ],
    });

    fixture = TestBed.createComponent(RatesEditListComponent);
    component = fixture.componentInstance;
  });

  const ratesFixtureWithId = () => ratesFixture().map(rate => ({
    ...rate,
    id: String(rate.duration),
  }));

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Rates input', () => {
     it('Should set rates and transform them', () => {
      const rates = ratesFixtureWithId();

      component.rates = ratesFixture();

      expect(component.rates).toMatchObject(rates);

      expect(component.transformedRates).toMatchObject(component['transformRates'](rates));
    });

    it('Should set initialRate when rates are not empty', () => {
      const rates = ratesFixture();

      component.rates = rates;

      expect(component.rates[0]).toMatchObject(ratesFixtureWithId()[0]);
    });

    it('Should not set initialRate when rates are empty', () => {
      const rates: RateInterface[] = [];

      component.rates = rates;

      expect(component.initialRate).toBeUndefined();
    });

    it('Should handle rates with missing IDs', () => {
      const rates = ratesFixture();

      component.rates = rates;

      expect(component.rates[0].duration).toEqual(6);
      expect(component.rates[1].duration).toEqual(9);
    });
  });

  describe('analyticsFormService', () => {
    const ANALYTICS_FORM_NAME = 'FORM_RATE_SELECT';

    let analyticsFormService: AnalyticsFormService;

    beforeEach(() => {
      analyticsFormService = TestBed.inject(AnalyticsFormService);
    });

    it('Should call emitEventFormItself with OPEN status on ngOnInit', () => {
      const spy = jest.spyOn(analyticsFormService, 'emitEventFormItself');
      component.ngOnInit();

      expect(spy).toHaveBeenCalledWith(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.OPEN);
    });

    it('Should call emitEventFormItself with CLOSED status on ngOnDestroy', () => {
      const spy = jest.spyOn(analyticsFormService, 'emitEventFormItself');
      component.ngOnDestroy();

      expect(spy).toHaveBeenCalledWith(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.CLOSED);
    });
  });

  describe('selectRateByDuration', () => {

    it('Should select the rate by ID and emit the selected rate', () => {
      const mockRateId = '10';
      const mockRates = ratesFixtureWithId();

      component.rates = mockRates;
      component.initialRate = mockRates[0];
      component.selectedRate = mockRates[0];

      const spySelectRate = jest.spyOn(component.selectRate, 'emit');

      component.selectRateByDuration(mockRateId);

      expect(component.selectedRate).toEqual(mockRates[2]);
      expect(spySelectRate).toHaveBeenCalledWith(mockRates[0]);
    });

    it('Should render SantanderDeSelectedRateDetailsComponent when selectedRate not empty', () => {
      const mockRateId = '1002';
      const mockRates = ratesFixture();

      component.rates = mockRates;
      component.initialRate = mockRates[0];
      component.selectedRate = mockRates[0];

      component.selectRateByDuration(mockRateId);

      fixture.detectChanges();

      const santanderDeSelectedRateDetailsEl =
        fixture.debugElement.query(By.directive(SantanderDeSelectedRateDetailsComponent));

      expect(santanderDeSelectedRateDetailsEl).toBeTruthy();
    });

    it('Should not call detectChanges if selectedRate already set', () => {
      const mockRateId = '1002';
      const mockRates = ratesFixture();

      component.rates = mockRates;
      component.initialRate = mockRates[2];
      component.selectedRate = mockRates[2];

      const spyDetectChanges = jest.spyOn(component['cdr'], 'detectChanges');
      const spySelectRate = jest.spyOn(component.selectRate, 'emit');

      component.selectRateByDuration(mockRateId);

      expect(spyDetectChanges).not.toHaveBeenCalled();
      expect(spySelectRate).toHaveBeenCalledWith(mockRates[2]);
    });

    it('Should emit initialRate when initial is true', () => {
      const mockRateId = '1002';
      const mockRates = ratesFixture();

      component.rates = mockRates;
      component.initialRate = mockRates[1];
      component.selectedRate = mockRates[2];
      component.initial = true;

      const spySelectRate = jest.spyOn(component.selectRate, 'emit');

      component.selectRateByDuration(mockRateId);

      expect(spySelectRate).toHaveBeenCalledWith(mockRates[1]);
    });
  });

  describe('selectRateByDuration', () => {

    it('should select a rate by duration', () => {
      const rates = ratesFixture();

      component.rates = rates;
      const initialRate = { ...rateFixture(), id: '1002' };
      component.initialRate = initialRate;
      component.selectedRate = undefined;
      component.initial = true;

      component.selectRateByDuration('10');

      expect(component.selectedRate).toEqual(ratesFixtureWithId()[0]);
      expect(component.initial).toBe(false);
    });
  });
});
