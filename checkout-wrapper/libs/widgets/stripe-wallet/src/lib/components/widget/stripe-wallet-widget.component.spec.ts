import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { widgetConfigFixture } from '../../test';

import { ApplePayComponent } from './apple-pay';
import { GooglePayComponent } from './google-pay';
import { StripeWalletWidgetComponent } from './stripe-wallet-widget.component';

describe('StripeWalletWidgetComponent', () => {
  let component: StripeWalletWidgetComponent;
  let fixture: ComponentFixture<StripeWalletWidgetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        StripeWalletWidgetComponent,
        ApplePayComponent,
        GooglePayComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  const createComponent = (paymentMethod: PaymentMethodEnum = PaymentMethodEnum.GOOGLE_PAY) => {
    fixture = TestBed.createComponent(StripeWalletWidgetComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('paymentMethod', paymentMethod);
    fixture.componentRef.setInput('amount', flowFixture().amount);
    fixture.componentRef.setInput('channelSet', flowFixture().channelSetId);
    fixture.componentRef.setInput('config', widgetConfigFixture());
    fixture.componentRef.setInput('cart', widgetConfigFixture().cart);
    fixture.componentRef.setInput('isDebugMode', widgetConfigFixture().isDebugMode);
    fixture.componentRef.setInput('theme', widgetConfigFixture().theme);
    fixture.autoDetectChanges(true);
  };

  describe('constructor', () => {
    it('should create an instance', () => {
      createComponent();
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should get google pay', async () => {
      createComponent(PaymentMethodEnum.GOOGLE_PAY);
      await fixture.whenStable();
      expect(fixture.debugElement.query(By.directive(ApplePayComponent))).toBeNull();
      expect(fixture.debugElement.query(By.directive(GooglePayComponent))).toBeTruthy();
    });

    it('should get apple pay', async () => {
      createComponent(PaymentMethodEnum.APPLE_PAY);
      await fixture.whenStable();
      expect(fixture.debugElement.query(By.directive(ApplePayComponent))).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(GooglePayComponent))).toBeNull();
    });

    it('should set min-width', () => {
      createComponent();
      const wrapper = fixture.debugElement.query(By.css('.stripe-wallet-wrapper')).nativeElement;
      expect(getComputedStyle(wrapper).minWidth).toEqual(`${widgetConfigFixture().minWidth}px`);
    });
  });
});
