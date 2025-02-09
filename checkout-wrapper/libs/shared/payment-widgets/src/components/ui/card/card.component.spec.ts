import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, DebugElement, ViewEncapsulation, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { By } from '@angular/platform-browser';
import resizeObserverPolyfill from 'resize-observer-polyfill';
import { from } from 'rxjs';
import { delay, switchMap, take, tap } from 'rxjs/operators';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  fakeOverlayContainer,
} from '@pe/checkout/testing';
import { CheckoutModeEnum, PaymentMethodEnum, RatesOrderEnum, WidgetConfigInterface } from '@pe/checkout/types';

import { PaymentWidgetsSdkModule } from '../../../payment-widgets-sdk.module';
import { UIBaseComponent } from '../base.component';
import { UIShadowRootWrapperComponent } from '../shadow-root-wrapper/shadow-root-wrapper.component';

import { UICardComponent } from './card.component';

@Component({
  selector: 'test-host',
  template: `
    <div >
      <finexp-ui-card>
        <div id="card_content">card content</div>
      </finexp-ui-card>
    </div>
  `,
})
class TestComponent { }

describe('finexp-ui-card', () => {
  let testComponent: TestComponent;
  let component: InstanceType<typeof UICardComponent>;
  let componentEl: DebugElement;
  let fixture: ComponentFixture<TestComponent>;
  global['ResizeObserver'] = resizeObserverPolyfill;
  let loader: HarnessLoader;
  const overlayContainer = fakeOverlayContainer();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentWidgetsSdkModule,
      ],
      providers: [
        overlayContainer.fakeElementContainerProvider,
        importProvidersFrom(PaymentWidgetsSdkModule),
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        TestComponent,
      ],
    }).overrideComponent(UIShadowRootWrapperComponent, {
      set: {
        encapsulation: ViewEncapsulation.None,
      },
    });
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    componentEl = fixture.debugElement.query(By.directive(UICardComponent));
    component = componentEl.componentInstance;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    fixture.debugElement.nativeElement.appendChild(overlayContainer.overlayContainerElement);
    initComponent();
  });


  const initComponent = (config: Partial<WidgetConfigInterface> = {}) => {
    component.config = {
      ratesOrder: RatesOrderEnum.Asc,
      payments: [
        {
          paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
          enabled: true,
          amountLimits: {
            min: 0,
            max: 10_0000,
          },
        },
      ],
      checkoutMode: CheckoutModeEnum.Calculator,
      minHeight: config.minHeight,
      maxHeight: config.maxHeight,
      minWidth: config.minWidth,
      maxWidth: config.maxWidth,
    };
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(testComponent).toBeTruthy();
      expect(componentEl).toBeTruthy();
      expect(component).toBeTruthy();
      expect(component instanceof UIBaseComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should render content', () => {
      fixture.detectChanges();
      const content = componentEl.query(By.css('#card_content'))?.nativeElement;

      expect(content).toBeTruthy();
      expect(content.innerHTML).toEqual('card content');
    });
    it('should open/close modal', () => {
      component.setAsModal = true;

      return from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap((dialogs) => {
          expect(dialogs.length).toEqual(1);
          const content = overlayContainer.overlayContainerElement
            .querySelector('#card_content');
          expect(content).toBeTruthy();
          expect(content.innerHTML).toEqual('card content');

          component.setAsModal = false;
        }),
        delay(300),
        switchMap(() => from(loader.getAllHarnesses(MatDialogHarness))),
        tap((dialogs) => {
          expect(dialogs.length).toEqual(0);
        }),
      ).toPromise();
    });

    it('styles', () => {
      component.ngOnChanges();
      expect(component.maxWidth).toEqual(0);
      expect(component.minWidth).toEqual(0);

      initComponent({ minWidth: 200, maxWidth: 400 });
      component.ngOnChanges();
      expect(component.maxWidth).toEqual(400);
      expect(component.minWidth).toEqual(200);

      initComponent({ minWidth: 500, maxWidth: 400 });
      component.ngOnChanges();
      expect(component.maxWidth).toEqual(500);
      expect(component.minWidth).toEqual(500);
    });

    it('on resize', () => {
      fixture.detectChanges();
      const card = componentEl.query(By.css('.pe-widget-card'))?.nativeElement;
      const wrapperContent = componentEl.query(By.css('.wrapper-content'))?.nativeElement;

      expect(card).toBeTruthy();
      expect(wrapperContent).toBeTruthy();

      component.onResize({
        target: card,
      } as ResizeObserverEntry);

      fixture.detectChanges();

      expect(wrapperContent.style.transform).toEqual('scale(0.608)');
    });

    it('on resize', () => {
      fixture.detectChanges();
      const card = componentEl.query(By.css('.pe-widget-card'))?.nativeElement;
      const wrapperContent = componentEl.query(By.css('.wrapper-content')).nativeElement;

      expect(card).toBeTruthy();
      expect(wrapperContent).toBeTruthy();

      jest.spyOn(wrapperContent, 'offsetHeight', 'get')
        .mockReturnValue(100);

      component.onContentResize({
        target: wrapperContent,
      } as ResizeObserverEntry);

      fixture.detectChanges();
      expect(card.style.height).toEqual('100px');
    });
  });
});

