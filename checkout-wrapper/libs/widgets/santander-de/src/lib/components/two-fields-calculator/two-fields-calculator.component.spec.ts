
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ViewEncapsulation, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { from, of, timer } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import {
  PaymentWidgetsSdkModule,
  UICardComponent,
  UIRateDropdownComponent,
  UIRegularTextComponent,
  UIShadowRootWrapperComponent,
  UIShortHeaderSantanderComponent,
  UIShowCheckoutWrapperButtonComponent,
} from '@pe/checkout/payment-widgets';
import {
  SetFlow,
} from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
  fakeOverlayContainer,
} from '@pe/checkout/testing';
import { CheckoutModeEnum, PaymentMethodEnum, RatesOrderEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures/flow-with-payment-options.fixture';
import { SantanderDeWidgetModule } from '../../santander-de-widget.module';
import { WidgetsApiService } from '../../services';
import { BaseWidgetComponent } from '../base-widget.component';

import { TwoFieldsCalculatorComponent } from './two-fields-calculator.component';


describe('two-fields-calculator component', () => {
  let store: Store;

  let component: TwoFieldsCalculatorComponent;
  let fixture: ComponentFixture<TwoFieldsCalculatorComponent>;
  let loader: HarnessLoader;
  const overlayContainer = fakeOverlayContainer();

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
        overlayContainer.fakeElementContainerProvider,
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
        TwoFieldsCalculatorComponent,
      ],
    }).overrideComponent(UIShadowRootWrapperComponent, {
      set: {
        encapsulation: ViewEncapsulation.None,
      },
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(TwoFieldsCalculatorComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    fixture.debugElement.nativeElement.appendChild(overlayContainer.overlayContainerElement);
  });

  const expectDialogContent = (selector: string) => {
    expect(overlayContainer.overlayContainerElement.querySelector(selector)).toBeTruthy();
  };

  const initComponent = (checkoutMode: CheckoutModeEnum = CheckoutModeEnum.Calculator) => {
    fixture.componentRef.setInput('config', {
      ratesOrder: RatesOrderEnum.Asc,
      payments: [
        {
          paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
        },
      ],
      checkoutMode,
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
    it('rate-dropdown I/O', () => {
      initComponent();
      const { child: rate, childEl: reteEl } = QueryChildByDirective(fixture, UIRateDropdownComponent);
      expect(reteEl).toBeTruthy();
      expect(rate.isLoading).toEqual(component.isLoadingRates);
      expect(rate.config).toEqual(component.config);
      expect(rate.forceDefaultStyles).toEqual(component.forceDefaultStyles);
      expect(rate.error).toEqual(component.error);
      expect(rate.rate).toEqual(component.currentRate);
      expect(rate.isShowSelectedRateDetails).toEqual(
        !component.hasShortToExtendedViewSwitcher || component.isExtendedView
      );
    });

    it('should render finexp-ui-short-header-santander', () => {
      initComponent();
      const { child: card } = QueryChildByDirective(fixture, UIShortHeaderSantanderComponent);
      expect(card.config).toEqual(component.config);
      expect(card.forceDefaultStyles).toEqual(component.forceDefaultStyles);
    });

    it('show-checkout-wrapper-button', (done) => {
      initComponent();
      const { child } = QueryChildByDirective(fixture, UIShowCheckoutWrapperButtonComponent);
      const onClicked = jest.spyOn(TwoFieldsCalculatorComponent.prototype, 'onClicked');
      child.clickedEmitter.emit();
      expect(onClicked).toBeCalled();
      expect(component.isExtendedView).toBe(true);
      from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap((dialogs) => {
          expect(dialogs.length).toEqual(1);

          expectDialogContent('finexp-ui-header-santander');
          expectDialogContent('finexp-ui-top-text');
          expectDialogContent('finexp-ui-rate-dropdown');
          expectDialogContent('finexp-ui-footer-powered-by-payever');
          expectDialogContent('finexp-ui-regular-text');

          done();
        }),
      ).subscribe();
    });

    it('finexp-ui-regular-text', () => {
      initComponent(CheckoutModeEnum.FinanceExpress);
      const { child: regularText } = QueryChildByDirective(fixture, UIRegularTextComponent);
      expect(regularText.config).toEqual(component.config);
      expect(regularText.forceDefaultStyles).toEqual(component.forceDefaultStyles);
      expect(component.getCreditFormatted()).toBeTruthy();
    });

    it('rate-dropdown isoLating', (done) => {
      initComponent();
      timer(500).pipe(
        take(1),
        tap(() => {
          fixture.detectChanges();
          expect(component.isLoadingRates).toBe(false);
          const { child } = QueryChildByDirective(fixture, UIRateDropdownComponent);
          expect(child.config).toEqual(component.config);
          expect(child.error).toEqual(component.error);
          expect(child.forceDefaultStyles).toEqual(component.forceDefaultStyles);
          expect(child.rate).toEqual(component.currentRate);
          expect(child.rates).toEqual(component.rates);
          expect(child.isShowSelectedRateDetails).toEqual(
            !component.hasShortToExtendedViewSwitcher || component.isExtendedView
          );

          const onRateSelected = jest.spyOn(TwoFieldsCalculatorComponent.prototype, 'onRateSelected');
          child.rateSelectedEmitter.emit(component.currentRate);
          expect(onRateSelected).toHaveBeenCalledWith(component.currentRate);
          done();
        })
      ).subscribe();
    });
  });
});

