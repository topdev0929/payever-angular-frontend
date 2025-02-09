import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { MockBuilder, MockRender, MockModule, ngMocks } from 'ng-mocks';
import { Subject, of, throwError } from 'rxjs';

import { StorageModule } from '@pe/checkout/storage';
import {
  CheckoutState,
  FlowState,
  ParamsState,
  PaymentState,
  SetFlow,
  SettingsState,
  StepsState,
  StoreModule,
} from '@pe/checkout/store';
import { CommonProvidersTestHelper } from '@pe/checkout/testing';


import {
  RateInterface,
  RatesCalculationService,
} from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { SantanderSeRatesModule } from '../../santander-se-rates.module';

import { RatesEditListComponent, RateToggleType } from './rates-edit-list.component';

const initialRates: RateInterface[] = [
  {
    annualFee: 0,
    baseInterestRate: 0,
    billingFee: 0,
    code: '3006',
    effectiveInterest: 5.3,
    monthlyCost: 2167,
    months: 6,
    payLaterType: true,
    startupFee: 195,
    totalCost: 13195,
  },
  {
    annualFee: 0,
    baseInterestRate: 11.05,
    billingFee: 30,
    code: '8411',
    effectiveInterest: 18.29,
    monthlyCost: 278,
    months: 72,
    payLaterType: false,
    startupFee: 495,
    totalCost: 20495,
  },
];

describe('santander-se-rates-edit-list', () => {
  let store: Store;

  beforeEach(() => {

    const module = MockBuilder(RatesEditListComponent, SantanderSeRatesModule)
      .keep(StoreModule, {
        exportAll: true,
        export: true,
      })
      .mock(RatesCalculationService, {
        fetchRatesOnce: () => of(initialRates),
        isLoading$: new Subject<boolean>(),
      })
      .provide([
        ...CommonProvidersTestHelper(),
      ])
      .build();

    TestBed.configureTestingModule({
      ...module,
      imports: [
        ...module.imports,
        MockModule(StorageModule),
        NgxsModule.forRoot([
          CheckoutState,
          FlowState,
          ParamsState,
          PaymentState,
          SettingsState,
          StepsState,
        ]),
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const initialInputs = () => {
    const flow = store.selectSnapshot(FlowState.flow);
    const paymentMethod = store.selectSnapshot(FlowState.paymentMethod);

    return {
      flowId: flow.id,
      total: flow.total,
      currency: flow.currency,
      paymentMethod: paymentMethod,
      initialData: {
        campaignCode: 'fakeCampaignCode',
      },
      rates: initialRates[0],
    };
  };

  describe('Constructor', () => {
    it('Should create an instance', () => {
      const fixture = MockRender(RatesEditListComponent, {}, { reset: true });
      expect(fixture.point.componentInstance).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should pass choose-rate inputs correctly', () => {
      const inputs = initialInputs();
      const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
      const component = fixture.point.componentInstance;
      const chooseRate = ngMocks.reveal(fixture, 'checkout-sdk-choose-rate');
      expect(ngMocks.input(chooseRate, 'trackFlowId')).toEqual(inputs.flowId);
      expect(ngMocks.input(chooseRate, 'trackPaymentMethod')).toEqual(inputs.paymentMethod);
      expect(ngMocks.input(chooseRate, 'selectedExtraDurations')).toEqual([]);
      expect(ngMocks.input(chooseRate, 'initialRateId')).toEqual(initialRates[1].code);
      expect(ngMocks.input(chooseRate, 'rates')).toEqual(component.transformedRates);
    });

    it('should emit selected rate', () => {
      const inputs = initialInputs();
      const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
      const component = fixture.point.componentInstance;
      const chooseRate = ngMocks.reveal(fixture, 'checkout-sdk-choose-rate');
      const selected = jest.spyOn(component.selected, 'emit');
      ngMocks.output(chooseRate, 'rateSelected').emit(initialRates[1].code);

      expect(selected).toBeCalledWith({ rate: initialRates[1], data: { campaignCode: initialRates[1].code } });
    });
  });

  it('should fetch rates on init', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;
    const fetchRates = jest.spyOn(component, 'fetchRates');
    component.ngOnInit();
    expect(fetchRates).toBeCalledTimes(1);
  });

  it('should emit rates on total change', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;
    const selected = jest.spyOn(component.selected, 'emit');
    component.setTotal = 10_000;
    expect(selected).toBeCalledWith({ rate: null, data: {} });
  });

  it('should call toggle with correct type', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;
    const toggleChanged = jest.spyOn(component as any, 'toggleChanged')
      .mockReturnValue(null);
    component['setToggleByRate'](null);
    expect(toggleChanged).not.toHaveBeenCalled();
    component['setToggleByRate']({ payLaterType: true } as RateInterface);
    expect(toggleChanged).toHaveBeenCalledWith(RateToggleType.BuyNowPayLater);
    component['setToggleByRate']({ payLaterType: false } as RateInterface);
    expect(toggleChanged).toHaveBeenCalledWith(RateToggleType.PartPayment);
  });

  it('should toggleChanged perform correctly', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;
    const doEmitRateSelected = jest.spyOn(component['trackingService'], 'doEmitRateSelected');
    const updateVisibleRates = jest.spyOn(component, 'updateVisibleRates')
      .mockReturnValue(null);

    component.selectedToggle = RateToggleType.PartPayment;
    component.toggleChanged(RateToggleType.PartPayment);
    expect(doEmitRateSelected).not.toHaveBeenCalled();
    expect(updateVisibleRates).not.toHaveBeenCalled();

    component.selectedToggle = RateToggleType.PartPayment;
    component.toggleChanged(RateToggleType.BuyNowPayLater);
    expect(doEmitRateSelected).toHaveBeenCalledWith(inputs.flowId, inputs.paymentMethod, null);
    expect(component.selectedToggle).toEqual(RateToggleType.BuyNowPayLater);
    expect(updateVisibleRates).toHaveBeenCalled();

  });

  it('should selectRateOnInit perform correctly with selectedRates', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    const getRateByFormData = jest.spyOn(component as any, 'getRateByFormData');
    const rateSelected = jest.spyOn(component, 'rateSelected');
    const doSelectRateNext = jest.spyOn(component.doSelectRate$, 'next');
    const setToggleByRate = jest.spyOn(component as any, 'setToggleByRate');
    const makeRateId = jest.spyOn(component, 'makeRateId')
      .mockReturnValue('rate-id');

    expect(component.selectedRate).not.toBeNull();
    component['selectRateOnInit']();
    expect(getRateByFormData).toHaveBeenCalledWith(component.initialData, component.rates);
    expect(doSelectRateNext).toHaveBeenCalledWith('rate-id');
    expect(makeRateId).toHaveBeenCalledWith(component.selectedRate);
    expect(setToggleByRate).toHaveBeenCalledWith(component.selectedRate);
    expect(rateSelected).not.toHaveBeenCalled();

  });

  it('should selectRateOnInit perform correctly if selectedRates empty', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    const getRateByFormData = jest.spyOn(component as any, 'getRateByFormData')
      .mockReturnValue(initialRates[0]);
    const rateSelected = jest.spyOn(component, 'rateSelected');
    const doSelectRateNext = jest.spyOn(component.doSelectRate$, 'next');
    const setToggleByRate = jest.spyOn(component as any, 'setToggleByRate');
    const makeRateId = jest.spyOn(component, 'makeRateId')
      .mockReturnValue('rate-id');

    component.selectedRate = null;
    component['selectRateOnInit']();
    expect(getRateByFormData).toHaveBeenCalledWith(component.initialData, component.rates);
    expect(component.selectedRate).toEqual(initialRates[0]);
    expect(makeRateId).toHaveBeenCalledWith(initialRates[0]);
    expect(doSelectRateNext).toHaveBeenCalledWith('rate-id');
    expect(setToggleByRate).toHaveBeenCalledWith(initialRates[0]);
    expect(rateSelected).not.toHaveBeenCalled();

  });

  it('should selectRateOnInit handle empty rates', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    const getRateByFormData = jest.spyOn(component as any, 'getRateByFormData');
    const doSelectRateNext = jest.spyOn(component.doSelectRate$, 'next');
    const setToggleByRate = jest.spyOn(component as any, 'setToggleByRate');
    const makeRateId = jest.spyOn(component, 'makeRateId');
    const rateSelected = jest.spyOn(component, 'rateSelected');

    component.rates = [];
    component['selectRateOnInit']();
    expect(getRateByFormData).not.toHaveBeenCalled();
    expect(doSelectRateNext).not.toHaveBeenCalled();
    expect(makeRateId).not.toHaveBeenCalled();
    expect(setToggleByRate).not.toHaveBeenCalled();
    expect(rateSelected).toHaveBeenCalledWith(null);

  });

  it('should update onlyDuration on input duration', () => {

    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;
    component.extraDuration = 1000;
    expect(component.onlyDuration).toEqual(1000);

  });

  it('should update currency and fetch rates if currentCurrency and currency are different', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;
    const fetchRates = jest.spyOn(component, 'fetchRates')
      .mockReturnValue(null);
    component.currency = 'USD';
    component.setCurrenct = 'EUR';
    expect(component.currency).toEqual('EUR');
    expect(fetchRates).toHaveBeenCalled();
  });

  it('should not fetch rates if currentCurrency and currency are the same', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;
    const fetchRates = jest.spyOn(component, 'fetchRates')
      .mockReturnValue(null);
    component.currency = 'USD';
    component.setCurrenct = 'USD';
    expect(component.currency).toEqual('USD');
    expect(fetchRates).not.toHaveBeenCalled();
  });

  it('should fetchRates update rates', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    jest.spyOn(component['ratesCalculationService'], 'fetchRatesOnce')
      .mockReturnValue(of(initialRates));

    component.fetchRates();

    expect(component.rates).toEqual(initialRates);
  });

  it('should fetchRates handle onlyDuration branch', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    jest.spyOn(component['ratesCalculationService'], 'fetchRatesOnce')
      .mockReturnValue(of(initialRates));
    const ratesFilter = jest.spyOn(component['rateUtilsService'], 'ratesFilter')
      .mockReturnValue([initialRates[0]]);
    component.onlyDuration = 1;

    component.fetchRates();

    expect(ratesFilter).toHaveBeenCalled();
    expect(component.rates).toEqual([initialRates[0]]);
  });

  it('should fetchRates handle error', () => {

    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    const error = new Error('test error');
    const fetchRatesOnce = jest.spyOn(component['ratesCalculationService'], 'fetchRatesOnce')
      .mockReturnValue(throwError(error));
    const hasFetchErrorNext = jest.spyOn(component.hasFetchError, 'next');
    const updateVisibleRates = jest.spyOn(component, 'updateVisibleRates');
    const ratesLoadedEmit = jest.spyOn(component.ratesLoaded, 'emit');

    component.fetchRates();

    expect(fetchRatesOnce).toHaveBeenCalled();
    expect(hasFetchErrorNext).toHaveBeenCalledWith(true);
    expect(component.ratesLoadError).toEqual(error.message);
    expect(component.rates).toEqual([]);
    expect(updateVisibleRates).toHaveBeenCalled();
    expect(ratesLoadedEmit).toHaveBeenCalled();

  });

  it('should makeRateId handle null', () => {
    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    expect(component.makeRateId(null)).toEqual(null);
  });

  it('should get translations', () => {

    const inputs = initialInputs();
    const fixture = MockRender(RatesEditListComponent, inputs, { reset: true });
    const component = fixture.point.componentInstance;

    expect(component.selectedRate.months).not.toEqual(1);
    expect(component.translations).toEqual({
      duration: $localize`:@@santander-se.duration.count_months:${component.selectedRate.months}:count:`,
    });

    component.selectedRate = {
      ...component.selectedRate,
      months: 1,
    };
    expect(component.selectedRate.months).toEqual(1);
    expect(component.translations).toEqual({
      duration: $localize`:@@santander-se.duration.one_month:${component.selectedRate.months}:count:`,
    });
  });

});

