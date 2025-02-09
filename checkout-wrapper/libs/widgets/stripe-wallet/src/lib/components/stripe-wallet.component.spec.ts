import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';
import { CommonProvidersTestHelper, flowFixture, QueryChildByDirective } from '@pe/checkout/testing';
import { PaymentMethodEnum, WidgetTypeEnum } from '@pe/checkout/types';
import { isDeviceAllowed } from '@pe/checkout/utils/device';

import { widgetConfigFixture } from '../test';

import { StripeWalletComponent } from './stripe-wallet.component';
import { StripeWalletWidgetComponent } from './widget';

jest.mock('@pe/checkout/utils/device', () => ({
  isDeviceAllowed: jest.fn(),
}));

describe('pe-stripe-wallet', () => {
  let component: StripeWalletComponent;
  let fixture: ComponentFixture<StripeWalletComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StripeWalletComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    })
      .overrideComponent(StripeWalletComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents();

    fixture = TestBed.createComponent(StripeWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  const initComponent = () => {
    fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
    fixture.componentRef.setInput('config', widgetConfigFixture());
    fixture.componentRef.setInput('amount', flowFixture().amount);
    fixture.componentRef.setInput('channelset', flowFixture().channelSetId);
    fixture.componentRef.setInput('cart', widgetConfigFixture().cart);
    fixture.componentRef.setInput('isdebugmode', widgetConfigFixture().isDebugMode);
    fixture.componentRef.setInput('paymentMethod', PaymentMethodEnum.GOOGLE_PAY);
    fixture.detectChanges();
  };

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('show widget / error ', () => {
    beforeEach(() => {
      initComponent();
      component.isReady$.next(true);
    });

    it('should show error if type not button', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Text);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(StripeWalletWidgetComponent))).toBeNull();
      expect(fixture.debugElement.nativeElement.textContent).toEqual(expect.any(String));
    });

    it('should show error if isDeviceAllowed return false', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      (isDeviceAllowed as jest.Mock).mockReturnValue(false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(StripeWalletWidgetComponent))).toBeNull();
      expect(fixture.debugElement.nativeElement.textContent).toEqual(expect.any(String));
    });

    it('should show error if previewPayment not equal paymentMethod', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      fixture.componentRef.setInput('config', {
        previewPayment: PaymentMethodEnum.GOOGLE_PAY,
      });
      fixture.componentRef.setInput('paymentMethod', PaymentMethodEnum.APPLE_PAY);
      (isDeviceAllowed as jest.Mock).mockReturnValue(false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(StripeWalletWidgetComponent))).toBeNull();
      expect(fixture.debugElement.nativeElement.textContent).toEqual(expect.any(String));
    });

    it('should show error if previewPayment undefined', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      fixture.componentRef.setInput('config', undefined);
      fixture.componentRef.setInput('paymentMethod', PaymentMethodEnum.APPLE_PAY);
      (isDeviceAllowed as jest.Mock).mockReturnValue(false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(StripeWalletWidgetComponent))).toBeNull();
      expect(fixture.debugElement.nativeElement.textContent).toEqual(expect.any(String));
    });

    it('should show widget if isDeviceAllowed return true', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      (isDeviceAllowed as jest.Mock).mockReturnValue(true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(StripeWalletWidgetComponent))).toBeTruthy();
    });

    it('should show widget if previewPayment equal paymentMethod', () => {
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      fixture.componentRef.setInput('config', {
        previewPayment: PaymentMethodEnum.GOOGLE_PAY,
      });
      fixture.componentRef.setInput('paymentMethod', PaymentMethodEnum.GOOGLE_PAY);
      (isDeviceAllowed as jest.Mock).mockReturnValue(false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(StripeWalletWidgetComponent))).toBeTruthy();
    });
  });

  describe('component', () => {
    beforeEach(() => {
      initComponent();
      fixture.componentRef.setInput('type', WidgetTypeEnum.Button);
      (isDeviceAllowed as jest.Mock).mockReturnValue(true);
      component.isReady$.next(true);
      fixture.detectChanges();
    });

    it('should stripe-wallet-widget I/O perform correctly', () => {
      const { child: stripeWidget } = QueryChildByDirective(fixture, StripeWalletWidgetComponent);
      expect(stripeWidget.amount).toEqual(component.amount);
      expect(stripeWidget.channelSet).toEqual(component.channelSet);
      expect(stripeWidget.config).toMatchObject(component.config);
      expect(stripeWidget.cart).toEqual(component.cart);
      expect(stripeWidget.isDebugMode).toEqual(component.isDebugMode);

      const clicked = jest.spyOn(component.clicked, 'emit');
      stripeWidget.clickedEmitter.emit();
      expect(clicked).toBeCalled();

      const onFailed = jest.spyOn(BaseWidgetCustomElementComponent.prototype, 'onFailed');
      stripeWidget.failedEmitter.emit();
      expect(onFailed).toBeCalled();
    });
  });

});
