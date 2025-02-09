import { ChangeDetectionStrategy, Component, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  PaymentWidgetsSdkModule,
  BaseWidgetComponent as BaseBaseWidgetComponent,
} from '@pe/checkout/payment-widgets';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  CheckoutAndCreditsInterface,
  CheckoutModeEnum,
  PaymentMethodEnum,
  RatesOrderEnum,
  WidgetTypeEnum,
} from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../test/fixtures/flow-with-payment-options.fixture';
import { CreditInterface } from '../models';
import { SantanderAtWidgetModule } from '../santander-at-widget.module';
import { WidgetsApiService } from '../services';

import { BaseWidgetComponent } from './base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'widget-santander-at-custom-element',
  template: '',
})
class BaseWidgetComponentTestComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.Button;

  get _rates() {
    return this.getRates();
  }
}

describe('base-widget component', () => {
  let store: Store;
  let component: BaseWidgetComponentTestComponent;
  let fixture: ComponentFixture<BaseWidgetComponentTestComponent>;
  const rates: CheckoutAndCreditsInterface<CreditInterface> = {
    currency: 'EUR',
    rates: [
      {
        amount: 50049.5,
        annualPercentageRate: 1,
        duration: 1,
        interest: 1,
        interestRate: 2,
        lastMonthPayment: 8338.54,
        monthlyPayment: 8343.54,
        totalCreditCost: 50049.5,
      },
    ],
  };

  beforeEach(() => {
    const ResizeObserverMock = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    global['ResizeObserver'] = ResizeObserverMock;
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentWidgetsSdkModule,
      ],
      providers: [
        importProvidersFrom(SantanderAtWidgetModule),
        ...CommonProvidersTestHelper(),
        MockProvider(WidgetsApiService, {
          getRates: () => of(rates),
        }),
      ],
      declarations: [
        BaseWidgetComponentTestComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(BaseWidgetComponentTestComponent);
    component = fixture.componentInstance;
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof BaseBaseWidgetComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('getCreditFormatted', () => {
      expect(component.getCreditFormatted(rates.rates[0])).toMatchObject({
        amount: 50049.5,
        amount_with_currency: null,
        annualPercentageRate: 1,
        duration: 1,
        interest: 1,
        interestRate: 2,
        lastMonthPayment: 8338.54,
        monthlyPayment: 8343.54,
        totalCreditCost: 50049.5,
        duration_with_months: '1',
        monthly_rate_with_currency: '$8,343.54',
        last_rate_with_currency: '$8,338.54',
        annual_percentage_rate_with_persent: '1%',
        total_interest_with_currency: '$1',
        total_with_currency: '$50,049.50',
        nominal_interest_rate_with_persent: '2%',
      });
    });
    it('onClicked Calculator', () => {
      fixture.componentRef.setInput('config', {
        ratesOrder: RatesOrderEnum.Asc,
        payments: [
          {
            paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
          },
        ],
        checkoutMode: CheckoutModeEnum.FinanceExpress,
      });
      fixture.detectChanges();
      const onClicked = jest.spyOn(BaseWidgetComponent.prototype, 'onClicked');
      component.onClicked();
      expect(onClicked).toBeCalled();
    });

    it('onClicked Calculator', () => {
      fixture.componentRef.setInput('config', {
        ratesOrder: RatesOrderEnum.Asc,
        payments: [
          {
            paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
          },
        ],
        checkoutMode: CheckoutModeEnum.Calculator,
      });
      fixture.detectChanges();
      expect(component.isExtendedView).toBe(false);
      component.onClicked();
      expect(component.isExtendedView).toBe(true);
    });
    it('getRates', (done) => {
      component._rates.pipe(
        tap((res) => {
          expect(res).toMatchObject(rates);
          done();
        })
      ).subscribe();
    });
  });
});

