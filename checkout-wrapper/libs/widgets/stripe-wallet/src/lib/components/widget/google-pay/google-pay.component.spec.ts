import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture, peEnvFixture } from '@pe/checkout/testing';
import { SnackBarModule, SnackBarService } from '@pe/checkout/ui/snackbar';

import { COMPONENT_CONFIG } from '../../../constants';
import { ComponentConfig } from '../../../models';
import { PaymentRequestAdapter, PayService } from '../../../services';
import { widgetConfigFixture } from '../../../test';

import { GooglePayComponent } from './google-pay.component';


describe('pe-apple-pay', () => {
  let component: GooglePayComponent;
  let fixture: ComponentFixture<GooglePayComponent>;

  const componentConfig: ComponentConfig = {
    amount: flowFixture().amount,
    deliveryFee: flowFixture().deliveryFee,
    channelSet: flowFixture().channelSetId,
    config: widgetConfigFixture(),
    cart: [],
    isDebugMode: widgetConfigFixture().isDebugMode,
    theme: widgetConfigFixture().theme,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        SnackBarModule,
        GooglePayComponent,
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
    fixture = TestBed.createComponent(GooglePayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      expect(getComputedStyle(button).backgroundImage).toEqual(`url(${cdn}/payment-widgets/icons/${theme}-theme-gpay.svg)`);
    });
  });

  describe('pay', () => {
    let init: jest.SpyInstance;
    let pay: jest.SpyInstance;
    let show: jest.SpyInstance;
    const paymentRequest = {
      show: jest.fn(),
    } as unknown as PaymentRequestAdapter;

    const spyOnServices = () => {
      init = jest.spyOn(PayService.prototype, 'init');
      pay = jest.spyOn(PayService.prototype, 'pay').mockReturnValue(of(null));
      show = jest.spyOn(SnackBarService.prototype, 'show');
    };

    it('should init and make pay after button click', () => {
      compileComponent();
      spyOnServices();
      init.mockReturnValue(of({ stripe: {}, paymentRequest }));

      fixture.debugElement.query(By.css('.button')).nativeElement.click();
      expect(init).toHaveBeenCalled();
      expect(paymentRequest.show).toHaveBeenCalled();
      expect(pay).toHaveBeenCalled();
    });

    it('should not call init and pay if debug mode', () => {
      TestBed.overrideProvider(COMPONENT_CONFIG, {
        useValue: {
          ...componentConfig,
          isDebugMode: true,
        },
      });
      compileComponent();
      spyOnServices();

      fixture.detectChanges();
      fixture.debugElement.query(By.css('.button')).nativeElement.click();

      expect(init).not.toHaveBeenCalled();
      expect(paymentRequest.show).not.toHaveBeenCalled();
      expect(pay).not.toHaveBeenCalled();
    });

    it('should show snackbar with init error', () => {
      compileComponent();
      spyOnServices();
      const error = new Error('pay error');
      init.mockReturnValue(throwError(error));

      fixture.debugElement.query(By.css('.button')).nativeElement.click();
      expect(init).toHaveBeenCalled();
      expect(pay).not.toHaveBeenCalled();
      expect(show).toHaveBeenCalledWith(error.message, expect.any(Object));
    });
  });
});
