
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
  UIRateTextComponent,
  UIRegularTextComponent,
  UISantanderIconShortComponent,
  UIShadowRootWrapperComponent,
  UIShowCheckoutWrapperButtonComponent,
} from '@pe/checkout/payment-widgets';
import {
  SetFlow,
} from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  ExpectNotToRenderChild,
  QueryChildByDirective,
  fakeOverlayContainer,
} from '@pe/checkout/testing';
import { CheckoutModeEnum, PaymentMethodEnum, RatesOrderEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test/fixtures/flow-with-payment-options.fixture';
import { SantanderAtWidgetModule } from '../../santander-at-widget.module';
import { WidgetsApiService } from '../../services';
import { BaseWidgetComponent } from '../base-widget.component';

import { TextComponent } from './text.component';

describe('text component', () => {
  let store: Store;

  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;
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
        importProvidersFrom(SantanderAtWidgetModule),
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
    }).overrideComponent(UIShadowRootWrapperComponent, {
      set: {
        encapsulation: ViewEncapsulation.None,
      },
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    fixture.debugElement.nativeElement.appendChild(overlayContainer.overlayContainerElement);
    initComponent();
  });

  const expectDialogContent = (selector: string) => {
    expect(overlayContainer.overlayContainerElement.querySelector(selector)).toBeTruthy();
  };
  
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
      expect(component).toBeTruthy();
      expect(component instanceof BaseWidgetComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should render ui-card', () => {
      const { child: card } = QueryChildByDirective(fixture, UICardComponent);
      expect(card).toBeTruthy();
      expect(card.asModal).toEqual(component.isExtendedView);
      expect(card.config).toEqual(component.config);
      expect(card.forceDefaultStyles).toEqual(component.forceDefaultStyles);
    });
    it('finexp-ui-rate-text I/O', () => {
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
      fixture.detectChanges();
      const { child } = QueryChildByDirective(fixture, UIRateTextComponent);
      expect(child.isLoading).toBe(true);
      expect(component.isLoadingRates).toBe(true);
      timer(500).pipe(
        take(1),
        tap(() => {
          fixture.detectChanges();
          expect(child.isLoading).toBe(false);
          expect(component.isLoadingRates).toBe(false);
          QueryChildByDirective(fixture, UISantanderIconShortComponent);

          const { child: regularText } = QueryChildByDirective(fixture, UIRegularTextComponent);
          expect(regularText.config).toEqual(component.config);
          expect(regularText.forceDefaultStyles).toEqual(component.forceDefaultStyles);
          expect(component.getCreditFormatted()).toBeTruthy();

          done();
        })
      ).subscribe();
    });

    it('show-checkout-wrapper-button', () => {
      const { child, childEl } = QueryChildByDirective(fixture, UIShowCheckoutWrapperButtonComponent);
      const onClicked = jest.spyOn(component.clickedEmitter, 'emit');
      child.clickedEmitter.emit();
      childEl.nativeElement.click();
      expect(onClicked).toBeCalled();
    });

    it('dialog-content', (done) => {
      component.isExtendedView = true;
      fixture.detectChanges();
      expect(component.isExtendedView).toBe(true);
      from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        tap((dialogs) => {
          expect(dialogs.length).toEqual(1);

          ExpectNotToRenderChild(fixture, UIRateTextComponent);

          expectDialogContent('finexp-ui-header-santander');
          expectDialogContent('finexp-ui-top-text');
          expectDialogContent('finexp-ui-rate-dropdown');
          expectDialogContent('finexp-ui-footer-powered-by-payever');
          done();
        }),
      ).subscribe();
    });
  });
});

