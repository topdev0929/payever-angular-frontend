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
import { SantanderNoWidgetModule } from '../santander-no-widget.module';
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
        importProvidersFrom(SantanderNoWidgetModule),
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
      fixture.componentRef.setInput('amount', 400.5);
      expect(component.getCreditFormatted(rates.rates[0])).toMatchObject({
        amount: 400.5,
        amount_with_currency: '$400.50',
        campaignCode: 'campaign-code',
        creditPurchase: 500,
        description: 'description',
        duration: 4,
        effectiveRate: 500,
        isFixedAmount: true,
        isInterestFree: false,
        monthlyAmount: 12000,
        title: 'fixed-amount',
        duration_with_months: '4',
        monthly_amount_with_currency: '$12,000',
        effective_rate_with_persent: '500%',
        credit_purchase_with_currency: '$500',
        credit_price_with_currency: '$99.50',
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

