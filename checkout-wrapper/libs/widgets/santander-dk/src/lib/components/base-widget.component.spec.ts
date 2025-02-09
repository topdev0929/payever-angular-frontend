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
  CheckoutModeEnum,
  PaymentMethodEnum,
  RatesOrderEnum,
  WidgetTypeEnum,
} from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../test/fixtures';
import { SantanderDkWidgetModule } from '../santander-dk-widget.module';
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
  const rates = ratesFixture();

  let store: Store;
  let component: BaseWidgetComponentTestComponent;
  let fixture: ComponentFixture<BaseWidgetComponentTestComponent>;

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
        importProvidersFrom(SantanderDkWidgetModule),
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
      fixture.componentRef.setInput('amount', 50049.5);
      expect(component.getCreditFormatted(rates.rates[0])).toMatchObject({
        amount: 50049.5,
        amount_with_currency: '$50,049.50',
        loan_amount: 31000,
        establishment_fee: 0,
        loan_duration_in_months: 12,
        nominal_interest: 14.95,
        effective_interest: 16.02,
        monthly_administration_fee: 0,
        payment_free_duration: 0,
        payment_free_intrest: 0,
        payment_free_pay_installments: false,
        start_date: '2024-04-01T08:24:42.1181099+02:00',
        terms_in_month: 12,
        annually_procent: 15.78,
        total_cost: 2529,
        total_loan_amount: 33529,
        monthly_payment: 2795,
        payment_free_duration_with_months: '0',
        payment_duration: 12,
        payment_duration_with_months: '12',
        terms_in_month_with_months: '12',
        monthly_payment_with_currency: '$2,795',
        effective_interest_with_persent: '16.02%',
        annually_procent_with_persent: '15.78%',
        total_cost_with_currency: '$2,529',
        total_loan_amount_with_currency: '$33,529',
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

