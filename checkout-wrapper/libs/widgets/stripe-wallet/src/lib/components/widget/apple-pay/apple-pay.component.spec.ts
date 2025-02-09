import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Stripe } from '@stripe/stripe-js';
import { of, throwError } from 'rxjs';

import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture, peEnvFixture } from '@pe/checkout/testing';
import { SnackBarModule, SnackBarService } from '@pe/checkout/ui/snackbar';

import { COMPONENT_CONFIG } from '../../../constants';
import { ComponentConfig } from '../../../models';
import { PaymentRequestAdapter, PayService } from '../../../services';
import { widgetConfigFixture } from '../../../test';

import { ApplePayComponent } from './apple-pay.component';

jest.mock('@pe/checkout/utils/from-intersection-observer', () => ({
  fromIntersectionObserver: jest.fn().mockReturnValue(of({ isIntersecting: true })),
}));

describe('pe-apple-pay', () => {
  let component: ApplePayComponent;
  let fixture: ComponentFixture<ApplePayComponent>;

  const componentConfig: ComponentConfig = {
    amount: flowFixture().amount,
    deliveryFee: flowFixture().deliveryFee,
    channelSet: flowFixture().channelSetId,
    config: widgetConfigFixture(),
    cart: [],
    isDebugMode: widgetConfigFixture().isDebugMode,
    theme: widgetConfigFixture().theme,
  };

  const paymentRequest = {
    show: jest.fn(),
  } as unknown as PaymentRequestAdapter;
  const stripe = {} as unknown as Stripe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        SnackBarModule,
        ApplePayComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        PayService,
        SnackBarService,
        { provide: COMPONENT_CONFIG, useValue: componentConfig },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  const compileComponent = () => {
    TestBed.compileComponents();
    fixture = TestBed.createComponent(ApplePayComponent);
    component = fixture.componentInstance;
  };

  describe('constructor', () => {
    it('should create an instance', () => {
      compileComponent();
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    beforeEach(() => {
      compileComponent();
      jest.spyOn(PayService.prototype, 'init')
        .mockReturnValue(of({ paymentRequest, stripe }));
      fixture.autoDetectChanges(true);
    });

    it('should show widget after init', () => {
      expect(fixture.debugElement.query(By.css('button'))).toBeTruthy();
    });

    it('should set config style', () => {
      const button = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(getComputedStyle(button).minWidth).toEqual(`${componentConfig.config.minWidth}px`);
      expect(getComputedStyle(button).maxWidth).toEqual(`${componentConfig.config.maxWidth}px`);
      expect(getComputedStyle(button).minHeight).toEqual(`${componentConfig.config.minHeight}px`);
      expect(getComputedStyle(button).height).toEqual(`${componentConfig.config.maxHeight}px`);
    });

    it('should set correct theme class', () => {
      const button = fixture.debugElement.query(By.css(`.${componentConfig.theme}`)).nativeElement;
      expect(button).toBeTruthy();
    });

    it('should set bg image', () => {
      const cdn = peEnvFixture().custom.cdn;
      const theme = componentConfig.theme;

      const button = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(getComputedStyle(button).backgroundImage).toEqual(`url(${cdn}/payment-widgets/icons/${theme}-theme-apay.svg)`);
    });
  });

  describe('component init / pay', () => {
    let init: jest.SpyInstance;
    let pay: jest.SpyInstance;
    let showError: jest.SpyInstance;

    const spyOnServices = () => {
      pay = jest.spyOn(PayService.prototype, 'pay')
        .mockReturnValue(of(null));
      init = jest.spyOn(PayService.prototype, 'init')
        .mockReturnValue(of({ paymentRequest, stripe }));
      showError = jest.spyOn(SnackBarService.prototype, 'show');
    };

    it('should init pay service', () => {
      compileComponent();
      spyOnServices();
      fixture.autoDetectChanges(true);

      expect(init).toHaveBeenCalled();
      expect(showError).not.toHaveBeenCalled();
    });

    it('should snackbar on init error', () => {
      compileComponent();
      spyOnServices();

      const error = new Error('init error');
      init.mockReturnValue(throwError(error));
      fixture.autoDetectChanges(true);

      expect(showError).toHaveBeenCalledWith(error.message, expect.any(Object));
    });

    it('should not call pay service if is debug mode', () => {
      TestBed.overrideProvider(COMPONENT_CONFIG, {
        useValue: {
          ...componentConfig,
          isDebugMode: true,
        },
      });
      compileComponent();
      spyOnServices();
      fixture.autoDetectChanges(true);

      fixture.debugElement.query(By.css('.button')).nativeElement.click();
      expect(paymentRequest.show).not.toHaveBeenCalled();
      expect(pay).not.toHaveBeenCalled();
      expect(showError).not.toHaveBeenCalled();
    });

    it('should call pay service pay fn after click', () => {
      compileComponent();
      spyOnServices();
      fixture.autoDetectChanges(true);

      fixture.debugElement.query(By.css('.button')).nativeElement.click();
      expect(paymentRequest.show).toHaveBeenCalled();
      expect(pay).toHaveBeenCalled();
      expect(showError).not.toHaveBeenCalled();
    });

    it('should show error on pay error', () => {
      compileComponent();
      spyOnServices();
      const error = new Error('pay error');
      pay.mockReturnValue(throwError(error));
      fixture.autoDetectChanges(true);

      fixture.debugElement.query(By.css('.button')).nativeElement.click();
      expect(paymentRequest.show).toHaveBeenCalled();
      expect(pay).toHaveBeenCalled();
      expect(showError).toHaveBeenCalledWith(error.message, expect.any(Object));
    });

    it('should show error on paymentRequest error', () => {
      compileComponent();
      spyOnServices();
      (paymentRequest.show as jest.Mock).mockImplementation(() => {
        throw new Error('payment request error');
      });
      fixture.autoDetectChanges(true);

      fixture.debugElement.query(By.css('.button')).nativeElement.click();
      expect(paymentRequest.show).toHaveBeenCalled();
      expect(showError).toHaveBeenCalledWith('payment request error', expect.any(Object));
    });

    it('should show error on paymentRequest error without message', () => {
      compileComponent();
      spyOnServices();
      const error = { error: 'test' };
      (paymentRequest.show as jest.Mock).mockImplementation(() => {
        throw error;
      });
      fixture.autoDetectChanges(true);

      fixture.debugElement.query(By.css('.button')).nativeElement.click();
      expect(paymentRequest.show).toHaveBeenCalled();
      expect(showError).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });
});
