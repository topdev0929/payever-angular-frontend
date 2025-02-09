
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
  UIRateButtonComponent,
  UIRegularTextComponent,
  UIShadowRootWrapperComponent,
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

import { ButtonComponent } from './button.component';


describe('button component', () => {
  let store: Store;

  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
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
        ButtonComponent,
      ],
    }).overrideComponent(UIShadowRootWrapperComponent, {
      set: {
        encapsulation: ViewEncapsulation.None,
      },
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.debugElement.nativeElement.appendChild(overlayContainer.overlayContainerElement);
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
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
    it('rate-btn I/O', () => {
      const { child: rate, childEl: reteEl } = QueryChildByDirective(fixture, UIRateButtonComponent);
      expect(reteEl).toBeTruthy();
      expect(rate.isLoading).toEqual(component.isLoadingRates);
      expect(rate.config).toEqual(component.config);
      expect(rate.forceDefaultStyles).toEqual(component.forceDefaultStyles);
      expect(rate.error).toEqual(component.error);
      expect(rate.rate).toEqual(component.currentRate);
      expect(rate.isShowSelectedRateDetails).toEqual(
        !component.hasShortToExtendedViewSwitcher || component.isExtendedView
      );
      const onClicked = jest.spyOn(ButtonComponent.prototype, 'onClicked');
      const clickedEmitter = jest.spyOn(component.clickedEmitter, 'emit');
      reteEl.nativeElement.click();
      expect(onClicked).toBeCalled();
      expect(clickedEmitter).toHaveBeenCalled();

    });
    it('rate-btn isoLating', (done) => {
      const { child } = QueryChildByDirective(fixture, UIRateButtonComponent);
      expect(component.isLoadingRates).toBe(true);
      expect(child.isLoading).toBe(true);
      timer(500).pipe(
        take(1),
        tap(() => {
          fixture.detectChanges();
          expect(component.isLoadingRates).toBe(false);
          expect(child.isLoading).toBe(false);

          const { child: regularText } = QueryChildByDirective(fixture, UIRegularTextComponent);
          expect(regularText.config).toEqual(component.config);
          expect(regularText.forceDefaultStyles).toEqual(component.forceDefaultStyles);
          expect(component.getCreditFormatted()).toBeTruthy();
          done();
        })
      ).subscribe();
    });
  });

  it('dialog-content', (done) => {
    component.isExtendedView = true;
    fixture.detectChanges();
    expect(component.isExtendedView).toBe(true);
    from(loader.getAllHarnesses(MatDialogHarness)).pipe(
      tap((dialogs) => {
        expect(dialogs.length).toEqual(1);

        ExpectNotToRenderChild(fixture, UIRateButtonComponent);

        expectDialogContent('finexp-ui-header-santander');
        expectDialogContent('finexp-ui-top-text');
        expectDialogContent('finexp-ui-rate-dropdown');
        expectDialogContent('finexp-ui-footer-powered-by-payever');
        done();
      }),
    ).subscribe();
  });
});

