import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockModule } from 'ng-mocks';
import { of } from 'rxjs';

import { AbstractContainerComponent } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { StorageModule } from '@pe/checkout/storage';
import { FlowState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PeCurrencyPipe } from '@pe/checkout/utils';

import { SantanderSeRatesModule } from '../../../rates/santander-se-rates.module';
import { RateInterface, RatesCalculationService } from '../../../shared/common';
import { flowWithPaymentOptionsFixture } from '../../../test/fixtures';
import { RatesInfoTableComponent } from '../rates-info-table/rates-info-table.component';


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

describe.only('santander-se-rates-info-table', () => {
  let store: Store;

  let component: RatesInfoTableComponent;
  let fixture: ComponentFixture<RatesInfoTableComponent>;
  let debugElement: HTMLElement;


  beforeEach(() => {
    const AbstractContainerComponentSpy = jest.spyOn(
      AbstractContainerComponent.prototype, 'paymentTitle', 'get',
    ).mockReturnValue('paymentTitle');


    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(RatesModule),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SantanderSeRatesModule),
        importProvidersFrom(StorageModule),
        { provide: AbstractContainerComponent, useVale: AbstractContainerComponentSpy },
      ],
      declarations: [
        RatesInfoTableComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(RatesInfoTableComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement.nativeElement;
  });

  const initiateComponent = (initialData: any) => {
    const flow = store.selectSnapshot(FlowState);
    const paymentMethod = flow.paymentOptions[0].paymentMethod;

    component.flowId = flow.id;
    component.paymentMethod = paymentMethod;
    component.initialData = initialData;
    component.total = flow.total;
    component.currency = 'USD';
    component.paymentTitle = 'paymentTitle';
    fixture.detectChanges();
  };

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    it('Should display content properly', () => {
      jest.spyOn(RatesCalculationService.prototype, 'fetchRatesOnce')
        .mockReturnValue(of(initialRates));
      initiateComponent({ campaignCode: '3006' });
      const currencyPipe = TestBed.inject(PeCurrencyPipe);

      expect(component.selectedRate).toEqual(initialRates[0]);

      const paymentTitle = debugElement.querySelector('#paymentTitle');
      const effectiveInterest = debugElement.querySelector('#effectiveInterest');
      const totalCost = debugElement.querySelector('#totalCost');
      const annualFee = debugElement.querySelector('#annualFee');
      const startupFee = debugElement.querySelector('#startupFee');
      const bnplBillingFee = debugElement.querySelector('#bnplBillingFee');

      expect(paymentTitle.innerHTML).toEqual('paymentTitle');
      expect(effectiveInterest.innerHTML).toEqual(`${initialRates[0].effectiveInterest}%`);
      expect(totalCost.innerHTML).toEqual(currencyPipe.transform(initialRates[0].totalCost, component.currency));
      expect(annualFee.innerHTML).toEqual(currencyPipe.transform(initialRates[0].annualFee, component.currency));
      expect(startupFee.innerHTML).toEqual(currencyPipe.transform(initialRates[0].startupFee, component.currency));
      expect(bnplBillingFee.innerHTML).toEqual(currencyPipe.transform(initialRates[0].billingFee, component.currency));
    });

    it('Should be empty', () => {
      jest.spyOn(RatesCalculationService.prototype, 'fetchRatesOnce')
        .mockReturnValue(of(initialRates));
      initiateComponent(null);

      expect(component.selectedRate).toBeFalsy();

      const paymentTitle = debugElement.querySelector('#paymentTitle');
      const effectiveInterest = debugElement.querySelector('#effectiveInterest');
      const totalCost = debugElement.querySelector('#totalCost');
      const annualFee = debugElement.querySelector('#annualFee');
      const startupFee = debugElement.querySelector('#startupFee');
      const bnplBillingFee = debugElement.querySelector('#bnplBillingFee');

      expect(paymentTitle.innerHTML).toEqual('paymentTitle');
      expect(effectiveInterest).toBeFalsy();
      expect(totalCost).toBeFalsy();
      expect(annualFee).toBeFalsy();
      expect(startupFee).toBeFalsy();
      expect(bnplBillingFee).toBeFalsy();
    });
  });

  describe('Translations', () => {
    let currencyTransform: jest.SpyInstance;
    let getMonthNameBNPL: jest.SpyInstance;
    const currency = '$';
    const month = 'august';

    beforeEach(() => {
      currencyTransform = jest.spyOn(component['currencyPipe'], 'transform')
        .mockImplementation((value, currency) => `${currency}${value}`);
      getMonthNameBNPL = jest.spyOn(component, 'getMonthNameBNPL')
        .mockReturnValue(month);
    });

    it('should get translations', () => {
      const rate = initialRates[0];
      component.currency = currency;
      component.selectedRate = rate;
      expect(component.translations).toMatchObject({
        titlePp: expect.stringContaining(`${currency}${rate.monthlyCost}`),
        titleBnpl: expect.stringContaining(`${currency}${rate.totalCost}`),
        duration: expect.stringContaining(`${rate.months}`),
      });
      expect(currencyTransform).toHaveBeenNthCalledWith(1, rate.monthlyCost, currency);
      expect(currencyTransform).toHaveBeenNthCalledWith(2, rate.totalCost, currency);
      expect(getMonthNameBNPL).toHaveBeenCalled();
    });

    it('should get translations handle branch', () => {
      const rate: RateInterface = {
        ...initialRates[0],
        monthlyCost: null,
        totalCost: null,
        months: 1,
      };
      component.currency = currency;
      component.selectedRate = rate;
      expect(component.translations).toMatchObject({
        titlePp: expect.stringContaining(`${currency}${rate.monthlyCost}`),
        titleBnpl: expect.stringContaining(`${currency}${rate.totalCost}`),
        duration: expect.stringContaining(`${rate.months}`),
      });
    });
  });

});
