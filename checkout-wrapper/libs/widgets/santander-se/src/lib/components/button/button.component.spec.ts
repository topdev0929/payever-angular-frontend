import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ViewEncapsulation, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { from, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  PaymentWidgetsSdkModule,
  UICardComponent,
  UIRateButtonComponent,
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

import { flowWithPaymentOptionsFixture, ratesFixture } from '../../../test/fixtures';
import { SantanderSeWidgetModule } from '../../santander-se-widget.module';
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
        importProvidersFrom(SantanderSeWidgetModule),
        ...CommonProvidersTestHelper(),
        MockProvider(WidgetsApiService, {
          getRates: () => of(ratesFixture()),
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
    try {
      expect(overlayContainer.overlayContainerElement.querySelector(selector)).toBeTruthy();
    } catch (e) {
      throw new Error(`child component not found ${selector}`);
    }
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
      expect(rate.isShowSelectedRateDetails).toEqual(component.isShowSelectedRateDetails);
      const onClicked = jest.spyOn(ButtonComponent.prototype, 'onClicked');
      const clickedEmitter = jest.spyOn(component.clickedEmitter, 'emit');
      reteEl.nativeElement.click();
      expect(onClicked).toBeCalled();
      expect(clickedEmitter).toHaveBeenCalled();

    });

  });

  it('dialog-content', (done) => {
    component.isExtendedView = true;
    fixture.detectChanges();
    expect(component.isExtendedView).toBe(true);
    QueryChildByDirective(fixture, UIRateButtonComponent);
    from(loader.getAllHarnesses(MatDialogHarness)).pipe(
      tap((dialogs) => {
        expect(dialogs.length).toEqual(1);

        ExpectNotToRenderChild(fixture, UIRateButtonComponent);

        expectDialogContent('finexp-ui-header-santander');
        expectDialogContent('finexp-ui-powered-by-payever');
        expectDialogContent('finexp-ui-top-big-text');
        expectDialogContent('finexp-ui-rate-dropdown');
        done();
      }),
    ).subscribe();
  });
});

