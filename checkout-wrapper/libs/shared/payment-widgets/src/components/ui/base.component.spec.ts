import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
} from '@pe/checkout/testing';
import {
  CheckoutModeEnum,
  PaymentMethodEnum,
  RatesOrderEnum,
  WidgetConfigInterface,
} from '@pe/checkout/types';

import { defaultCustomWidgetConfig } from '../../constants';

import { UIBaseComponent } from './base.component';

@Component({
  selector: 'ui-base-test-component',
  template: '',
})
class TestComponent extends UIBaseComponent {
}

describe('ui-base-component', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        TestComponent,
      ],
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    initComponent();
  });

  const initComponent = (config: Partial<WidgetConfigInterface> = {}) => {
    fixture.componentRef.setInput('config', {
      ratesOrder: config.ratesOrder || RatesOrderEnum.Asc,
      payments: config.payments || [
        {
          paymentMethod: PaymentMethodEnum.SANTANDER_INSTALLMENT,
        },
      ],
      checkoutMode: config.checkoutMode || CheckoutModeEnum.FinanceExpress,
      styles: config.styles || {},
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
      expect(component instanceof UIBaseComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('currentStyles', () => {
      const styles = {
        backgroundColor: 'background-color',
        lineColor: 'line-color',
        mainTextColor: 'main-text-color',
        regularTextColor: 'regular-text-color',
        ctaTextColor: 'cta-text-color',
        buttonColor: 'button-color',
        fieldBackgroundColor: 'field-background-color',
        fieldLineColor: 'field-line-color',
        fieldArrowColor: 'field-arrow-color',
        headerTextColor: 'header-text-color',
      };
      initComponent({ styles });

      expect(component.currentStyles).toMatchObject(styles);

      fixture.componentRef.setInput('forceDefaultStyles', true);
      expect(component.currentStyles).toMatchObject(defaultCustomWidgetConfig().styles);
    });

    it('onElementResized', () => {
      expect(component.isSmallSize).toBe(false);
      component.onElementResized({
        contentRect: {
          width: 379,
        },
      } as ResizeObserverEntry);
      expect(component.isSmallSize).toBe(true);
      component.onElementResized({
        contentRect: {
          width: 380,
        },
      } as ResizeObserverEntry);
      expect(component.isSmallSize).toBe(false);
    });

  });
});

