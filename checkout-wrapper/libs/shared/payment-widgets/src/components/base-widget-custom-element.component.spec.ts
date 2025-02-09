import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  peEnvFixture,
} from '@pe/checkout/testing';
import {
  CheckoutModeEnum,
  PaymentMethodEnum,
  RatesOrderEnum,
} from '@pe/checkout/types';

import { BaseWidgetCustomElementComponent } from './base-widget-custom-element.component';

@Component({
  selector: 'base-widget-custom-element-test-component',
  template: '',
})
class TestComponent extends BaseWidgetCustomElementComponent {
}

describe('base-widget-custom-element-component', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
      })),
    });

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
      expect(component instanceof BaseWidgetCustomElementComponent).toBeTruthy();
    });
  });

  describe('component', () => {
    it('inputs', () => {
      fixture.componentRef.setInput('theme', 'dark');
      expect(component.theme).toEqual('dark');
      fixture.componentRef.setInput('theme', 'light');
      expect(component.theme).toEqual('light');

      fixture.componentRef.setInput('theme', '');
      expect(component.theme).toEqual('dark');

      fixture.componentRef.setInput('channelset', 'channel-set-id');
      expect(component.channelSet).toEqual('channel-set-id');

      fixture.componentRef.setInput('type', 'type');
      expect(component.type).toEqual('type');

      const env = peEnvFixture();
      fixture.componentRef.setInput('env', env);
      expect(component.env).toEqual(env);

      fixture.componentRef.setInput('paymentMethod', PaymentMethodEnum.IVY);
      expect(component.paymentMethod).toEqual(PaymentMethodEnum.IVY);

      fixture.componentRef.setInput('isdebugmode', 'true');
      expect(component.isDebugMode).toEqual(true);
      fixture.componentRef.setInput('isdebugmode', false);
      expect(component.isDebugMode).toEqual(false);
      fixture.componentRef.setInput('isdebugmode', 'any');
      expect(component.isDebugMode).toEqual(false);

      fixture.componentRef.setInput('amount', 1_000);
      expect(component.amount).toEqual(1_000);
    });

    it('calling onFailed should set isReady$ to false', () => {
      fixture.detectChanges();
      expect(component.isReady$.getValue()).toBe(true);
      component.onFailed();
      expect(component.isReady$.getValue()).toBe(false);
    });

    it('onClicked should emit', () => {
      const clicked = jest.spyOn(component.clicked, 'emit');
      component.onClicked();
      expect(clicked).toBeCalled();
    });
  });
});

