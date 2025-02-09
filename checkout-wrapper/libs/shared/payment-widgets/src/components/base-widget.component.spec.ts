import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError, timer } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';
import {
  CheckoutModeEnum,
  PaymentMethodEnum,
  RateInterface,
  RatesOrderEnum,
  WidgetConfigInterface,
} from '@pe/checkout/types';

import { BaseWidgetComponent } from './base-widget.component';

const rates = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
];

@Component({
  selector: 'base-widget-component-test-component',
  template: '',
})
class TestComponent extends BaseWidgetComponent<any> {
  getRates() {
    return this.amount === 0
      ? throwError(new Error('amount should be grater than 0'))
      : of({
        currency: 'DE',
        rates,
      });
  }

  transformRate(rate: any) {
    return rate;
  }
}

describe('base-widget-component', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        TestComponent,
      ],
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    initComponent();
  });

  const initComponent = (config: Partial<WidgetConfigInterface> = {}) => {
    fixture.componentRef.setInput('config', {
      ratesOrder: config.ratesOrder || RatesOrderEnum.Asc,
      payments: config.payments || [
        {
          paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
        },
      ],
      checkoutMode: config.checkoutMode || CheckoutModeEnum.FinanceExpress,
    });
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof BaseWidgetComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it.each([
      {
        checkoutMode: CheckoutModeEnum.Calculator,
        isFinCalc: true,
        hasShortToExtendedViewSwitcher: true,
        isFinExp: false,
        isShowWrapperButtonVisible: false,
        isNone: false,
      },
      {
        checkoutMode: CheckoutModeEnum.FinanceExpress,
        isFinCalc: false,
        hasShortToExtendedViewSwitcher: false,
        isFinExp: true,
        isShowWrapperButtonVisible: true,
        isNone: false,
      },
      {
        checkoutMode: CheckoutModeEnum.None,
        isFinCalc: false,
        hasShortToExtendedViewSwitcher: false,
        isFinExp: false,
        isShowWrapperButtonVisible: false,
        isNone: true,
      },
    ])('Case %#: %p', (arg) => {
      initComponent({ checkoutMode: arg.checkoutMode });
      expect(component.isFinCalc).toEqual(arg.isFinCalc);
      expect(component.isNone).toEqual(arg.isNone);
      expect(component.isFinExp).toEqual(arg.isFinExp);
      expect(component.hasShortToExtendedViewSwitcher)
        .toEqual(arg.hasShortToExtendedViewSwitcher);
      expect(component.isShowWrapperButtonVisible)
        .toEqual(arg.isShowWrapperButtonVisible);
    });

    it('isBNPL', () => {
      initComponent({
        payments: [
          {
            paymentMethod: PaymentMethodEnum.IVY,
            isBNPL: true,
            enabled: true,
            amountLimits: {
              min: 0,
              max: 1_000,
            },
          },
          {
            paymentMethod: PaymentMethodEnum.IVY,
            isBNPL: false,
            enabled: true,
            amountLimits: {
              min: 0,
              max: 2_000,
            },
          },
          {
            paymentMethod: PaymentMethodEnum.IVY,
            enabled: true,
            amountLimits: {
              min: 0,
              max: 3_000,
            },
          },
        ],
      });

      fixture.componentRef.setInput('amount', 1_000);
      expect(component.isBNPL).toBe(true);

      fixture.componentRef.setInput('amount', 2_000);
      expect(component.isBNPL).toBe(false);

      fixture.componentRef.setInput('amount', 3_000);
      expect(component.isBNPL).toBe(false);

      fixture.componentRef.setInput('amount', 5_000);
      expect(component.isBNPL).toBe(false);
    });

    it('onClicked should emit', () => {
      const clicked = jest.spyOn(component.clickedEmitter, 'emit');
      component.onClicked();
      expect(clicked).toBeCalled();
    });

    it('productId', () => {
      initComponent({
        payments: [
          {
            paymentMethod: PaymentMethodEnum.IVY,
            productId: 'product-id',
            enabled: true,
            amountLimits: {
              min: 0,
              max: 1_000,
            },
          },
          {
            paymentMethod: PaymentMethodEnum.IVY,
            enabled: true,
            amountLimits: {
              min: 0,
              max: 1_000,
            },
          },
        ],
      });
      fixture.componentRef.setInput('amount', 1_000);
      expect(component.productId).toEqual('product-id');

      fixture.componentRef.setInput('amount', 2_000);
      expect(component.productId).toEqual(null);
    });

    it('onRateSelected', () => timer(500).pipe(
      take(1),
      tap(() => {
        const selecredRate: RateInterface = {
          listTitle: 'list-title',
          selectedTitle: 'selected-title',
          selectedMultiTitles: [],
          details: [],
          value: null,
          raw: null,
        };
        component.onRateSelected(selecredRate);
        expect(component.currentRate).toMatchObject(selecredRate);
      })
    ).toPromise());

    it('toPercent', () => {
      expect(component.toPercent(60.4123)).toEqual('60.41%');
    });

    it('toPrice', () => {
      expect(component.toPrice(60.4123)).toEqual('$60.41');
      expect(component.toPrice(60)).toEqual('$60');
      expect(component.toPriceNumber(60.4123)).toEqual('60.41');
      expect(component.toPriceNumber(null)).toEqual('');
    });

    it('should load rates', () => {
      fixture.detectChanges();
      expect(component.isLoadingRates).toBe(true);

      return timer(500).pipe(
        take(1),
        tap(() => {
          expect(component.isLoadingRates).toBe(false);
          expect(component.currentRate).toBe(rates.at(-1));
          expect(component.error).toEqual(null);

          initComponent({ ratesOrder: RatesOrderEnum.Desc });
          expect(component.rates).toMatchObject(rates.slice().reverse());
        })
      ).toPromise();
    });
    it('error loading rates', () => {
      fixture.componentRef.setInput('amount', 0);
      fixture.detectChanges();
      expect(component.isLoadingRates).toBe(true);
      const failed = jest.spyOn(component.failedEmitter, 'emit');

      return timer(500).pipe(
        take(1),
        tap(() => {
          expect(component.isLoadingRates).toBe(false);
          expect(component.currentRate).toBeFalsy();
          expect(component.error).toEqual('amount should be grater than 0');
          expect(failed).toBeCalled();
        })
      ).toPromise();
    });
  });
});

