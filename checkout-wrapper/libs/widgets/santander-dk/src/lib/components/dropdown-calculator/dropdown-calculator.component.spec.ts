import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ViewEncapsulation, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { By } from '@angular/platform-browser';
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
  ExpectNotToRenderChild,
  QueryChildByDirective,
  fakeOverlayContainer,
} from '@pe/checkout/testing';
import { CheckoutModeEnum, PaymentMethodEnum, RatesOrderEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../../test/fixtures';
import { SantanderDkWidgetModule } from '../../santander-dk-widget.module';
import { WidgetsApiService } from '../../services';
import { BaseWidgetComponent } from '../base-widget.component';

import { DropdownCalculatorComponent } from './dropdown-calculator.component';

describe('dropdown-calculator component', () => {
  let store: Store;

  let component: DropdownCalculatorComponent;
  let fixture: ComponentFixture<DropdownCalculatorComponent>;
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
        importProvidersFrom(SantanderDkWidgetModule),
        ...CommonProvidersTestHelper(),
        MockProvider(WidgetsApiService, {
          getRates: () => of(ratesFixture()),
        }),
      ],
      declarations: [
        DropdownCalculatorComponent,
      ],
    }).overrideComponent(UIShadowRootWrapperComponent, {
      set: {
        encapsulation: ViewEncapsulation.None,
      },
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(DropdownCalculatorComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    fixture.debugElement.nativeElement.appendChild(overlayContainer.overlayContainerElement);
    initComponent();
  });

  const expectDialogContent = (selector: string) => {
    expect(overlayContainer.overlayContainerElement.querySelector(selector)).toBeTruthy();
  };

  const initComponent = (isBNPL = false) => {
    fixture.componentRef.setInput('config', {
      ratesOrder: RatesOrderEnum.Asc,
      payments: [
        {
          paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
          isBNPL,
          enabled: true,
          amountLimits: {
            min: 0,
            max: 10_0000,
          },
        },
      ],
      checkoutMode: CheckoutModeEnum.Calculator,
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

    describe('headerText translations', () => {
      it('BNPL', () => {
        initComponent(true);
        fixture.componentRef.setInput('amount', 1000);
        fixture.detectChanges();
        expect(component.isBNPL).toBe(true);
        expect(component.translations.headerText)
          .toEqual($localize`:@@santander-dk-finexp-widget.bnpl.calculator.header_text:`);
      });

      it('regular', () => {
        fixture.componentRef.setInput('amount', 1000);
        fixture.detectChanges();
        expect(component.isBNPL).toBe(false);
        expect(component.translations.headerText)
        .toEqual($localize`:@@santander-dk-finexp-widget.regular.calculator.header_text:`);
      });
    });
    it('should render ui-card', () => {
      const { child: card } = QueryChildByDirective(fixture, UICardComponent);
      expect(card).toBeTruthy();
      expect(card.asModal).toEqual(component.isExtendedView);
      expect(card.config).toEqual(component.config);
      expect(card.forceDefaultStyles).toEqual(component.forceDefaultStyles);
    });
    it('rate-dropdown I/O', () => {
      const { child: rate, childEl: reteEl } = QueryChildByDirective(fixture, UIRateDropdownComponent);
      expect(reteEl).toBeTruthy();
      expect(rate.isLoading).toEqual(component.isLoadingRates);
      expect(rate.config).toEqual(component.config);
      expect(rate.forceDefaultStyles).toEqual(component.forceDefaultStyles);
      expect(rate.error).toEqual(component.error);
      expect(rate.rate).toEqual(component.currentRate);
      expect(rate.rates).toEqual(component.rates);
    });

    it('should render finexp-ui-short-header-santander', () => {
      const { child: card } = QueryChildByDirective(fixture, UIShortHeaderSantanderComponent);
      expect(card.config).toEqual(component.config);
      expect(card.forceDefaultStyles).toEqual(component.forceDefaultStyles);
    });

    it('show-checkout-wrapper-button', (done) => {
      const { child } = QueryChildByDirective(fixture, UIShowCheckoutWrapperButtonComponent);
      const onClicked = jest.spyOn(DropdownCalculatorComponent.prototype, 'onClicked');
      child.clickedEmitter.emit();
      expect(onClicked).toBeCalled();
      expect(component.isExtendedView).toBe(true);
      from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap((dialogs) => {
          expect(dialogs.length).toEqual(1);

          ExpectNotToRenderChild(fixture, UIShortHeaderSantanderComponent);

          expectDialogContent('finexp-ui-header-santander');
          expectDialogContent('finexp-ui-powered-by-payever');
          expectDialogContent('finexp-ui-top-big-text');
          expectDialogContent('finexp-ui-rate-dropdown');
          done();
        }),
      ).subscribe();
    });

    it('rate-dropdown isoLating', (done) => {
      fixture.detectChanges();
      expect(component.hasAOP).toBeFalsy();
      const childEl = fixture.debugElement.query(By.directive(UIRegularTextComponent));
      expect(childEl).toBeFalsy();
      const { child } = QueryChildByDirective(fixture, UIRateDropdownComponent);
      expect(component.isLoadingRates).toBe(true);
      expect(child.isLoading).toBe(true);
      timer(500).pipe(
        take(1),
        tap(() => {
          fixture.detectChanges();
          expect(component.isLoadingRates).toBe(false);
          expect(child.isLoading).toBe(false);
          expect(child.config).toEqual(component.config);
          expect(child.error).toEqual(component.error);
          expect(child.forceDefaultStyles).toEqual(component.forceDefaultStyles);
          expect(child.rate).toEqual(component.currentRate);
          expect(child.rates).toEqual(component.rates);

          const onRateSelected = jest.spyOn(DropdownCalculatorComponent.prototype, 'onRateSelected');
          child.rateSelectedEmitter.emit(component.currentRate);
          expect(onRateSelected).toHaveBeenCalledWith(component.currentRate);

          expect(component.hasAOP).toBe(true);
          const { child: regularText } = QueryChildByDirective(fixture, UIRegularTextComponent);
          expect(regularText.config).toEqual(component.config);
          expect(regularText.forceDefaultStyles).toEqual(component.forceDefaultStyles);
          expect(component.getCreditFormatted()).toBeTruthy();
          done();
        })
      ).subscribe();
    });
  });
});

