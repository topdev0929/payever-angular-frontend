import { OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AnalyticFormStatusEnum } from '@pe/checkout/analytics';
import {
  ChooseRateComponent,
  KitChooseRateComponent,
  KitRateViewComponent,
  RateUtilsService,
  SantanderDeSelectedRateDetailsComponent,
} from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { FlowExtraDurationType } from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { LocaleConstantsService } from '@pe/checkout/utils';

import {
  ProductTypeEnum,
  RateInterface,
  RateToggleType,
  RatesCalculationApiService,
  RatesCalculationService,
} from '../../../shared';

import { RatesEditListComponent } from './rates-edit-list.component';

describe('RatesEditListComponent', () => {
  let component: RatesEditListComponent;
  let fixture: ComponentFixture<RatesEditListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        OverlayModule,
        PaymentTextModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        RatesCalculationService,
        RatesCalculationApiService,
        RateUtilsService,
        LocaleConstantsService,
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

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call analyticsFormService.emitEventFormItself with correct arguments', () => {
      const emitEventFormItselfSpy = jest.spyOn(component['analyticsFormService'], 'emitEventFormItself');

      component.ngOnInit();

      expect(emitEventFormItselfSpy).toHaveBeenCalledWith('FORM_RATE_SELECT', AnalyticFormStatusEnum.OPEN);
    });

    it('should call fetchRates', () => {
      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.ngOnInit();

      expect(fetchRatesSpy).toHaveBeenCalled();
    });
  });


  describe('setTotal', () => {
    it('should call fetchRates when total changes', () => {
      component.setTotal = 100;
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setTotal = 200;
      fixture.detectChanges();

      expect(fetchRatesSpy).toHaveBeenCalled();
    });

    it('should not call fetchRates when total does not change', () => {
      component.setTotal = 100;
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setTotal = 100;
      fixture.detectChanges();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
    });
  });

  describe('setCurrency', () => {
    it('should call fetchRates when currency changes', () => {
      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCurrenct = 'USD';
      fixture.detectChanges();

      component.setCurrenct = 'EUR';
      fixture.detectChanges();

      expect(fetchRatesSpy).toHaveBeenCalled();
    });

    it('should not call fetchRates when currency does not change', () => {
      component.setCurrenct = 'USD';
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCurrenct = 'USD';
      fixture.detectChanges();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
    });

    it('should not call fetchRates when currency is undefined', () => {
      component.setCurrenct = 'USD';
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCurrenct = undefined;
      fixture.detectChanges();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
    });

    it('should not call fetchRates when currentCurrency is undefined', () => {
      component.setCurrenct = undefined;
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCurrenct = 'USD';
      fixture.detectChanges();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
    });
  });

  describe('setCreditType', () => {
    it('should call fetchRates when creditType changes', () => {
      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCreditType = ProductTypeEnum.HANDLEKONTO;
      fixture.detectChanges();

      component.setCreditType = ProductTypeEnum.STUDENTKONTO;
      fixture.detectChanges();

      expect(fetchRatesSpy).toHaveBeenCalled();
    });

    it('should not call fetchRates when creditType does not change', () => {
      component.setCreditType = ProductTypeEnum.HANDLEKONTO;
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCreditType = ProductTypeEnum.HANDLEKONTO;
      fixture.detectChanges();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
    });

    it('should not call fetchRates when creditType is undefined', () => {
      component.setCreditType = ProductTypeEnum.HANDLEKONTO;
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCreditType = undefined;
      fixture.detectChanges();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
    });

    it('should not call fetchRates when currentCreditType is undefined', () => {
      component.setCreditType = undefined;
      fixture.detectChanges();

      const fetchRatesSpy = jest.spyOn(component, 'fetchRates');

      component.setCreditType = ProductTypeEnum.HANDLEKONTO;
      fixture.detectChanges();

      expect(fetchRatesSpy).not.toHaveBeenCalled();
    });
  });

  describe('setExtraDuration', () => {
    it('should set onlyDuration property', () => {
      const duration: FlowExtraDurationType = 10;

      component.extraDuration = duration;

      expect(component.onlyDuration).toBe(duration);
    });
  });

  describe('toggleChanged', () => {
    it('should set selectedToggle and call updateVisibleRates when selectedToggle changes', () => {
      const selectedToggle: RateToggleType = RateToggleType.BuyNowPayLater;
      const updateVisibleRatesSpy = jest.spyOn(component, 'updateVisibleRates');

      component.selectedToggle = null;

      component.toggleChanged(selectedToggle);

      expect(component.selectedToggle).toBe(selectedToggle);
      expect(updateVisibleRatesSpy).toHaveBeenCalled();
    });

    it('should call doEmitRateSelected when selectedToggle changes from a non-null value', () => {
      const selectedToggle: RateToggleType = RateToggleType.BuyNowPayLater;
      const doEmitRateSelectedSpy = jest.spyOn(component['trackingService'], 'doEmitRateSelected');
      const updateVisibleRatesSpy = jest.spyOn(component, 'updateVisibleRates');

      component.selectedToggle = RateToggleType.PartPayment;

      component.toggleChanged(selectedToggle);

      expect(doEmitRateSelectedSpy).toHaveBeenCalledWith(component.flowId, component.paymentMethod, null);
      expect(updateVisibleRatesSpy).toHaveBeenCalled();
    });

    it('should not call doEmitRateSelected when selectedToggle changes to null', () => {
      const selectedToggle: RateToggleType = null;
      const doEmitRateSelectedSpy = jest.spyOn(component['trackingService'], 'doEmitRateSelected');
      const updateVisibleRatesSpy = jest.spyOn(component, 'updateVisibleRates');

      component.selectedToggle = RateToggleType.PartPayment;

      component.toggleChanged(selectedToggle);

      expect(doEmitRateSelectedSpy).not.toHaveBeenCalled();
      expect(updateVisibleRatesSpy).not.toHaveBeenCalled();
    });

    it('should not call updateVisibleRates when selectedToggle does not change', () => {
      const selectedToggle: RateToggleType = RateToggleType.BuyNowPayLater;
      const updateVisibleRatesSpy = jest.spyOn(component, 'updateVisibleRates');

      component.selectedToggle = selectedToggle;

      component.toggleChanged(selectedToggle);

      expect(updateVisibleRatesSpy).not.toHaveBeenCalled();
    });
  });

  describe('fetchRates', () => {
    let fetchRatesOnce: jest.SpyInstance;
    let hasFetchError: jest.SpyInstance;
    let selectRateOnInit: jest.SpyInstance;
    let updateVisibleRates: jest.SpyInstance;
    let ratesLoadedEmit: jest.SpyInstance;
    let ratesFilter: jest.SpyInstance;
    const rates = [{ isFixedAmount: true, campaignCode: '1' }] as RateInterface[];

    beforeEach(() => {
      fetchRatesOnce = jest.spyOn(component['ratesCalculationService'], 'fetchRatesOnce');
      hasFetchError = jest.spyOn(component.hasFetchError, 'next');
      selectRateOnInit = jest.spyOn(component as any, 'selectRateOnInit')
        .mockReturnValue(null);
      updateVisibleRates = jest.spyOn(component, 'updateVisibleRates')
        .mockReturnValue(null);
      ratesLoadedEmit = jest.spyOn(component.ratesLoaded, 'emit');
      ratesFilter = jest.spyOn(component['rateUtilsService'], 'ratesFilter')
        .mockImplementation(value => value);
    });
    it('should fetchRates perform correctly', fakeAsync(() => {
      fetchRatesOnce.mockReturnValue(of(rates));
      const onlyDuration = 1;
      component.onlyDuration = onlyDuration;

      component.fetchRates();
      tick();
      expect(hasFetchError).toHaveBeenCalledWith(false);
      expect(ratesFilter).toHaveBeenCalledWith(rates, 'duration', onlyDuration);
      expect(component.rates).toEqual(rates);
      expect(selectRateOnInit).toHaveBeenCalled();
      expect(updateVisibleRates).toHaveBeenCalled();
      expect(ratesLoadedEmit).toHaveBeenCalled();
    }));

    it('should fetchRates perform correctly with onlyDuration 0', fakeAsync(() => {
      fetchRatesOnce.mockReturnValue(of(rates));
      const onlyDuration = 0;
      component.onlyDuration = onlyDuration;

      component.fetchRates();
      tick();
      expect(hasFetchError).toHaveBeenCalledWith(false);
      expect(ratesFilter).not.toHaveBeenCalled();
      expect(component.rates).toEqual(rates);
      expect(selectRateOnInit).toHaveBeenCalled();
      expect(updateVisibleRates).toHaveBeenCalled();
      expect(ratesLoadedEmit).toHaveBeenCalled();
    }));

    it('should fetchRates perform correctly if fetchRatesOnce return null', fakeAsync(() => {
      fetchRatesOnce.mockReturnValue(of(null));
      const onlyDuration = 0;
      component.onlyDuration = onlyDuration;

      component.fetchRates();
      tick();
      expect(hasFetchError).toHaveBeenCalledWith(false);
      expect(ratesFilter).not.toHaveBeenCalled();
      expect(component.rates).toEqual([]);
      expect(selectRateOnInit).toHaveBeenCalled();
      expect(updateVisibleRates).toHaveBeenCalled();
      expect(ratesLoadedEmit).toHaveBeenCalled();
    }));

    it('should fetchRates handle error', fakeAsync(() => {
      const error = new Error('test');
      fetchRatesOnce.mockReturnValue(throwError(error));

      component.fetchRates();
      tick();
      expect(hasFetchError).toHaveBeenCalledWith(true);
      expect(component.rates).toEqual([]);
      expect(component.ratesLoadError).toEqual(error.message);
      expect(selectRateOnInit).not.toHaveBeenCalled();
      expect(updateVisibleRates).toHaveBeenCalled();
      expect(ratesLoadedEmit).toHaveBeenCalled();
    }));

    it('should fetchRates handle unknown error', fakeAsync(() => {
      const error = new Error();
      fetchRatesOnce.mockReturnValue(throwError(error));

      component.fetchRates();
      tick();
      expect(hasFetchError).toHaveBeenCalledWith(true);
      expect(component.rates).toEqual([]);
      expect(component.ratesLoadError).toEqual($localize`:@@santander-no.credit_rates.error.cant_request:`);
      expect(selectRateOnInit).not.toHaveBeenCalled();
      expect(updateVisibleRates).toHaveBeenCalled();
      expect(ratesLoadedEmit).toHaveBeenCalled();
    }));
  });

  describe('selectRateOnInit', () => {
    it('should call rateSelected with null when rates array is empty', () => {
      const rateSelectedSpy = jest.spyOn(component, 'rateSelected');

      component.rates = [];
      component['selectRateOnInit']();

      expect(rateSelectedSpy).toHaveBeenCalledWith(null);
    });

    it('should set selectedRate to the first non-BNPL rate when rates array has elements and no initialData', () => {
      const rate1 = { isFixedAmount: true, campaignCode: '1' } as RateInterface;
      const rate2 = { isFixedAmount: false, campaignCode: '2' } as RateInterface;
      const firstNotBnplRate = rate1;
      const doSelectRate$Spy = jest.spyOn(component.doSelectRate$, 'next');

      component.rates = [rate1, rate2];
      component['selectRateOnInit']();

      expect(component.selectedRate).toBe(firstNotBnplRate);
      expect(doSelectRate$Spy).toHaveBeenCalledWith('1');
    });

    it('should call setToggleByRate with selectedRate', () => {
      const rate1 = { isFixedAmount: false } as RateInterface;
      const rate2 = { isFixedAmount: true } as RateInterface;
      const firstNotBnplRate = rate2;
      const setToggleByRateSpy = jest.spyOn(component as any, 'setToggleByRate');

      component.rates = [rate1, rate2];
      component['selectRateOnInit']();

      expect(setToggleByRateSpy).toHaveBeenCalledWith(firstNotBnplRate);
    });
  });

  describe('toPrice', () => {
    let transform: jest.SpyInstance;
    const currency = 'en-US';

    beforeEach(() => {
      component.currency = currency;
      transform = jest.spyOn(component['currencyPipe'], 'transform')
        .mockImplementation(value => `$${value}`);
    });

    it('should handle if value has not the remainder of the division', () => {
      const value = 10;
      expect(component['toPrice'](value)).toEqual(`$${value}`);
      expect(transform).toHaveBeenCalledWith(value, currency, 'symbol-narrow', '1.0-2');
    });

    it('should handle if value has the remainder of the division', () => {
      const value = 12.4;
      expect(component['toPrice'](value)).toEqual(`$${value}`);
      expect(transform).toHaveBeenCalledWith(value, currency, 'symbol-narrow', '1.2-2');
    });
  });
});
