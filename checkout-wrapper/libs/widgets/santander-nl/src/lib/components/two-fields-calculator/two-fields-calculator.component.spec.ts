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
  UIFullHeaderSantanderComponent,
  UIRateDropdownComponent,
  UISantanderConsumerIconMediumComponent,
  UIShadowRootWrapperComponent,
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

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../../test/fixtures';
import { SantanderNlWidgetModule } from '../../santander-nl-widget.module';
import { WidgetsApiService } from '../../services';
import { BaseWidgetComponent } from '../base-widget.component';
import { TopImageComponent } from '../top-image/top-image.component';

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
        importProvidersFrom(SantanderNlWidgetModule),
        ...CommonProvidersTestHelper(),
        MockProvider(WidgetsApiService, {
          getRates: () => of(ratesFixture()),
        }),
      ],
      declarations: [
        TopImageComponent,
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

    it('should render finexp-ui-full-header-santander', () => {
      QueryChildByDirective(fixture, UIFullHeaderSantanderComponent);
      QueryChildByDirective(fixture, TopImageComponent);
      QueryChildByDirective(fixture, UISantanderConsumerIconMediumComponent);
    });

    it('show-checkout-wrapper-button should open dialog', (done) => {
      const { child } = QueryChildByDirective(fixture, UIShowCheckoutWrapperButtonComponent);
      const onClicked = jest.spyOn(TwoFieldsCalculatorComponent.prototype, 'onClicked');
      child.clickedEmitter.emit();
      expect(onClicked).toBeCalled();
      expect(component.isExtendedView).toBe(true);
      from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap((dialogs) => {
          expect(dialogs.length).toEqual(1);

          expectDialogContent('widget-santander-nl-top-image');
          expectDialogContent('finexp-ui-top-text');
          expectDialogContent('finexp-ui-rate-dropdown');
          expectDialogContent('finexp-ui-regular-text');
          expectDialogContent('finexp-ui-footer-powered-by-payever');
          done();
        }),
      ).subscribe();
    });

    it('rate-dropdown isoLating', (done) => {
      const { child } = QueryChildByDirective(fixture, UIRateDropdownComponent);
      expect(child.isLoading).toEqual(true);
      expect(component.isLoadingRates).toBe(true);

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

          const onRateSelected = jest.spyOn(TwoFieldsCalculatorComponent.prototype, 'onRateSelected');
          child.rateSelectedEmitter.emit(component.currentRate);
          expect(onRateSelected).toHaveBeenCalledWith(component.currentRate);
          done();
        })
      ).subscribe();
    });
  });
});

