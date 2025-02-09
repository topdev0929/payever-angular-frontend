
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { of, timer } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import {
  PaymentWidgetsSdkModule,
  UICardComponent,
  UIRateTextComponent,
  UIRegularTextComponent,
  UISantanderIconShortComponent,
  UIShowCheckoutWrapperButtonComponent,
} from '@pe/checkout/payment-widgets';
import {
  SetFlow,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { CheckoutModeEnum, PaymentMethodEnum, RatesOrderEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures/flow-with-payment-options.fixture';
import { SantanderDeWidgetModule } from '../../santander-de-widget.module';
import { WidgetsApiService } from '../../services';
import { BaseWidgetComponent } from '../base-widget.component';

import { TextComponent } from './text.component';



describe('text component', () => {
  let store: Store;

  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

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
        importProvidersFrom(SantanderDeWidgetModule),
        ...CommonProvidersTestHelper(),
        MockProvider(WidgetsApiService, {
          getRates: () => of({
            currency: 'EUR',
            rates: [
              {
                amount: 50049.5,
                annualPercentageRate: 1,
                duration: 6,
                interest: 1,
                interestRate: 2,
                lastMonthPayment: 8338.54,
                monthlyPayment: 8343.54,
                specificData: {
                  firstInstallment: 8342.8,
                  processingFee: 25,
                  rsvTotal: 3,
                },
                totalCreditCost: 50049.5,
              },
            ],
          }),
        }),
      ],
      declarations: [
        TextComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
  });


  const initComponent = () => {
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
  };

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      initComponent();
      expect(component).toBeTruthy();
      expect(component instanceof BaseWidgetComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should render ui-card', () => {
      initComponent();
      const { child: card } = QueryChildByDirective(fixture, UICardComponent);
      expect(card).toBeTruthy();
      expect(card.asModal).toEqual(component.isExtendedView);
      expect(card.config).toEqual(component.config);
      expect(card.forceDefaultStyles).toEqual(component.forceDefaultStyles);
    });
    it('finexp-ui-rate-text I/O', () => {
      initComponent();
      const { child: rate, childEl: reteEl } = QueryChildByDirective(fixture, UIRateTextComponent);
      expect(reteEl).toBeTruthy();
      expect(rate.isLoading).toEqual(component.isLoadingRates);
      expect(rate.config).toEqual(component.config);
      expect(rate.forceDefaultStyles).toEqual(component.forceDefaultStyles);
      expect(rate.error).toEqual(component.error);
      expect(rate.rate).toEqual(component.currentRate);
      expect(rate.isShowSelectedRateDetails).toEqual(!component.hasShortToExtendedViewSwitcher);
    });
    it('rate-btn isoLating', (done) => {
      initComponent();
      timer(500).pipe(
        take(1),
        tap(() => {
          fixture.detectChanges();
          expect(component.isLoadingRates).toBe(false);
          QueryChildByDirective(fixture, UISantanderIconShortComponent);
          done();
        })
      ).subscribe();
    });

    it('finexp-ui-regular-text', () => {
      initComponent();
      const { child } = QueryChildByDirective(fixture, UIRegularTextComponent);
      expect(child.config).toEqual(component.config);
      expect(child.forceDefaultStyles).toEqual(component.forceDefaultStyles);
      expect(component.getCreditFormatted()).toBeTruthy();
    });

    it('show-checkout-wrapper-button', () => {
      initComponent();
      const { child, childEl } = QueryChildByDirective(fixture, UIShowCheckoutWrapperButtonComponent);
      const onClicked = jest.spyOn(component.clickedEmitter, 'emit');
      child.clickedEmitter.emit();
      childEl.nativeElement.click();
      expect(onClicked).toBeCalled();
    });
  });
});

