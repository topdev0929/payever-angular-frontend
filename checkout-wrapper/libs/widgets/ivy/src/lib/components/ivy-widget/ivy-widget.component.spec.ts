import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Renderer2 } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

import { StorageService } from '@pe/checkout/storage';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  flowFixture,
} from '@pe/checkout/testing';
import { SnackBarModule, SnackBarService } from '@pe/checkout/ui/snackbar';

import { MessageType } from '../../enums';
import { ChooseBankMessage } from '../../models';
import { IvyWidgetApiService, IvyWidgetService } from '../../services';
import {
  connectionFixture,
  flowSettingsFixture,
  widgetConfigFixture,
} from '../../test';
import { IvyIframeComponent } from '../iframe';
import { TooltipStyleComponent } from '../tooltip/style/style.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

import { IvyWidgetComponent } from './ivy-widget.component';

describe('ivy-widget', () => {
  let component: IvyWidgetComponent;
  let fixture: ComponentFixture<IvyWidgetComponent>;

  let ivyService: IvyWidgetService;
  let storageService: StorageService;
  let snackbarService: SnackBarService;

  const addEventListener = jest.fn();

  const dispose = jest.fn();
  const attach = jest.fn();
  const remove = jest.fn();
  const backdropClick = jest.fn().mockReturnValue(of(null));

  const mockOverlayRef = {
    dispose,
    attach,
    backdropElement: {
      remove,
    },
    backdropClick,
  } as unknown as OverlayRef;

  const create = jest.fn().mockReturnValue(mockOverlayRef);
  const withDefaultOffsetY = jest.fn().mockReturnValue('positionStrategy');
  const withPositions = jest.fn().mockReturnValue({
    withDefaultOffsetY,
  });
  const flexibleConnectedTo = jest.fn().mockReturnValue({
    withPositions,
  });
  const position = jest.fn().mockReturnValue({
    flexibleConnectedTo,
    global: jest.fn(),
  });
  const block = jest.fn().mockReturnValue('scrollStrategy');

  const mockOverlay = {
    create,
    position,
    scrollStrategies: {
      block,
    },
  } as unknown as Overlay;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      addEventListener,
      dispatchEvent: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      matches: false,
      media: query,
    })),
  });

  const listen = jest.fn();

  const mockRenderer = {
    listen,
  };

  const chooseBankMessage: ChooseBankMessage = {
    colors: {
      bgDark: 'bgDark',
      bgLight: 'bgLight',
      textDark: 'textDark',
      textLight: 'textLight',
    },
    consent: true,
    displayName: 'displayName',
    groupId: 'groupId',
    logo: 'logo',
    source: 'ivy',
    type: MessageType.Choose,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        SnackBarModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        StorageService,
        SnackBarService,
        IvyWidgetService,
        IvyWidgetApiService,
        { provide: Overlay, useValue: mockOverlay },
        { provide: Renderer2, useValue: mockRenderer },
      ],
      declarations: [
        IvyWidgetComponent,
        TooltipComponent,
        TooltipStyleComponent,
        IvyIframeComponent,
      ],
    }).compileComponents();

    ivyService = TestBed.inject(IvyWidgetService);
    storageService = TestBed.inject(StorageService);
    snackbarService = TestBed.inject(SnackBarService);

    fixture = TestBed.createComponent(IvyWidgetComponent);
    component = fixture.componentInstance;

    component['overlayRef'] = mockOverlayRef;
  });

  const initComponent = () => {
    fixture.componentRef.setInput('config', widgetConfigFixture());
    fixture.componentRef.setInput('amount', flowFixture().amount);
    fixture.componentRef.setInput('channelSet', flowFixture().channelSetId);
    fixture.componentRef.setInput('cart', widgetConfigFixture().cart);
    fixture.componentRef.setInput('isDebugMode', widgetConfigFixture().isDebugMode);
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      initComponent();
      expect(component).toBeTruthy();
    });
  });

  describe('removeBank', () => {
    it('should removeBank remove ivy from storage', () => {
      jest.spyOn(storageService, 'remove').mockReturnValue(null);
      component['removeBank']();
      expect(storageService.remove).toHaveBeenCalledWith('ivy-bank');
    });
  });

  describe('chooseBank', () => {
    beforeEach(() => {
      jest.spyOn(storageService, 'set');
    });

    it('should save to storage data if consent true', () => {
      component['chooseBank'](chooseBankMessage);
      expect(storageService.set).toHaveBeenCalledWith('ivy-bank', JSON.stringify(chooseBankMessage));
    });

    it('should not save to storage data if consent false', () => {
      component['chooseBank']({
        ...chooseBankMessage,
        consent: false,
      });
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should set bankSelected true and call dispose', () => {
      expect(component.bankSelected).toBeFalsy();
      component['chooseBank'](chooseBankMessage);
      expect(component.bankSelected).toBeTruthy();
      expect(dispose).toHaveBeenCalled();
    });

    it('should handle if overlayRef null', () => {
      component['overlayRef'] = null;
      component['chooseBank'](chooseBankMessage);
      expect(dispose).not.toHaveBeenCalled();
    });
  });

  describe('openBankSelection', () => {
    const element = '<div>' as unknown as HTMLDivElement;
    it('should create overlayRef', () => {
      component.openBankSelection(element);
      expect(create).toHaveBeenCalledWith({
        backdropClass: 'ivy-iframe-backdrop',
        positionStrategy: 'positionStrategy',
        disposeOnNavigation: true,
        scrollStrategy: 'scrollStrategy',
        hasBackdrop: true,
      });
      expect(position).toHaveBeenCalled();
      expect(flexibleConnectedTo).toHaveBeenCalledWith(element);
      expect(withPositions).toHaveBeenCalledWith([
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
        },
      ]);
      expect(withDefaultOffsetY).toHaveBeenCalledWith(-10);
    });

    it('should attach IvyIframeComponent', () => {
      component.openBankSelection(element);
      const componentPortal = new ComponentPortal(IvyIframeComponent);
      expect(attach).toHaveBeenCalledWith(componentPortal);
    });

    it('should dispose after backdropClick', fakeAsync(() => {
      component.openBankSelection(element);
      tick();
      expect(backdropClick).toHaveBeenCalled();
      expect(dispose).toHaveBeenCalled();
    }));
  });

  describe('startIvy', () => {
    it('should startIvy call trigger startSubject', () => {
      jest.spyOn(component['startSubject$'], 'next');
      component.startIvy();
      expect(component['startSubject$'].next).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call all listeners fn', () => {
      const mockListeners = Array(10).fill(jest.fn());
      (component as any).listeners = mockListeners;

      component.ngOnDestroy();

      mockListeners.forEach((listener) => {
        expect(listener).toHaveBeenCalled();
      });
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.spyOn(component as any, 'removeBank');
    });

    it('should push listen in listeners array', () => {
      component.ngOnInit();
      expect(component['listeners']).not.toBeNull();
    });

    it('should call addEventListener on theme', () => {
      component.ngOnInit();
      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should set isUserThemeDark true', () => {
      addEventListener.mockImplementation((_, cb) => cb({ matches: true }));
      component.ngOnInit();
      expect(component['isUserThemeDark']).toBeTruthy();
    });

    it('should set isUserThemeDark false', () => {
      addEventListener.mockImplementation((_, cb) => cb({ matches: false }));
      component.ngOnInit();
      expect(component['isUserThemeDark']).toBeFalsy();
    });

    it('should call removeBank if message type Remove', (done) => {
      component.ngOnInit();
      component['messageSubject$'].subscribe(() => {
        expect(component['removeBank']).toHaveBeenCalled();

        done();
      });
      component['messageSubject$'].next({ type: MessageType.Remove } as any);
    });

    it('should not call removeBank if message type Choose', (done) => {
      component.ngOnInit();
      component['messageSubject$'].subscribe(() => {
        expect(component['removeBank']).not.toHaveBeenCalled();

        done();
      });
      component['messageSubject$'].next({ type: MessageType.Choose } as any);
    });
  });

  describe('loading$', () => {
    it('should loading if startSubject$ triggered', (done) => {
      component.isDebugMode = false;
      component.loading$.subscribe((isLoading) => {
        expect(isLoading).toBeTruthy();

        done();
      });
      component['startSubject$'].next();
    });
  });

  describe('start$', () => {
    const response = {
      paymentDetails: {
        redirectUrl: 'https://payever-redirect-url.org',
      },
    };

    let createFlow: jest.SpyInstance;
    let getConnection: jest.SpyInstance;
    let submitPayment: jest.SpyInstance;

    const payload = {
      channelSetId: flowFixture().channelSetId,
      amount: flowFixture().amount,
      cart: widgetConfigFixture().cart,
      deliveryFee: widgetConfigFixture().shippingOption?.price,
      noticeUrl: widgetConfigFixture().noticeUrl,
      cancelUrl: widgetConfigFixture().cancelUrl,
      failureUrl: window.location.href,
      successUrl: widgetConfigFixture().successUrl,
      pendingUrl: widgetConfigFixture().pendingUrl,
    };

    beforeEach(() => {
      initComponent();

      createFlow = jest.spyOn(ivyService, 'createFlow').mockReturnValue(of(flowFixture()));
      getConnection = jest.spyOn(ivyService, 'getConnection').mockReturnValue(of(connectionFixture()));
      submitPayment = jest.spyOn(ivyService, 'submitPayment').mockReturnValue(of(response));

      jest.spyOn(ivyService, 'getSettings').mockReturnValue(of(flowSettingsFixture()));
      jest.spyOn(snackbarService, 'toggle').mockReturnValue(null);
    });
    it('should call create flow', (done) => {
      component['start$'].pipe(tap(() => {
        expect(createFlow).toHaveBeenCalledWith(payload);
        done();
      })).subscribe();

      component['startSubject$'].next();
    });
    it('should handle shippingOption.price null', (done) => {
      component.config = {
        ...widgetConfigFixture(),
        shippingOption: null,
      };
      component['start$'].pipe(tap(() => {
        expect(createFlow).toHaveBeenCalledWith({
          ...payload,
          deliveryFee: 0,
        });
        done();
      })).subscribe();

      component['startSubject$'].next();
    });
    it('should get connection and submit payment', (done) => {
      component['start$'].pipe(tap(() => {
        expect(createFlow).toHaveBeenCalledWith(payload);
        expect(getConnection).toHaveBeenCalledWith(component.channelSet);
        expect(submitPayment).toHaveBeenCalledWith(
          flowFixture(),
          connectionFixture()._id,
          component.amount,
          component.channelSet,
          flowSettingsFixture(),
          component.config,
          component.cart,
        );
        done();
      })).subscribe();

      component['startSubject$'].next();
    });
    it('should handle array message error create flow error', (done) => {
      const testError: any = {
        error: {
          message: [],
          error: 'Test Error',
        },
      };
      createFlow.mockReturnValue(throwError(testError));

      component['start$'].subscribe((condition) => {
        expect(condition).toBeFalsy();
        expect(snackbarService.toggle).toHaveBeenCalledWith(true, testError.error.error, {
          duration: 5000,
        });

        done();
      });

      component['startSubject$'].next();
    });
    it('should handle message error create flow error', (done) => {
      const testError: any = {
        error: {
          message: 'Test Error',
        },
      };
      createFlow.mockReturnValue(throwError(testError));

      component['start$'].subscribe((condition) => {
        expect(condition).toBeFalsy();
        expect(snackbarService.toggle).toHaveBeenCalledWith(true, testError.error.message, {
          duration: 5000,
        });

        done();
      });

      component['startSubject$'].next();
    });
    it('should handle error without message create flow error', (done) => {
      const testError: any = {
        error: {
          message: null,
          error: 'Test error',
        },
      };
      createFlow.mockReturnValue(throwError(testError));

      component['start$'].subscribe((condition) => {
        expect(condition).toBeFalsy();
        expect(snackbarService.toggle).toHaveBeenCalledWith(true, testError.error, {
          duration: 5000,
        });

        done();
      });

      component['startSubject$'].next();
    });
    it('should handle error with errors create flow error', (done) => {
      const testError: any = {
        errors: [{
          message: 'Test error',
        }],
      };
      createFlow.mockReturnValue(throwError(testError));

      component['start$'].subscribe((condition) => {
        expect(condition).toBeFalsy();
        expect(snackbarService.toggle).toHaveBeenCalledWith(true, testError.errors[0].message, {
          duration: 5000,
        });

        done();
      });

      component['startSubject$'].next();
    });
    it('should handle undefined error create flow error', (done) => {
      const testError: any = {
        error: null,
      };

      createFlow.mockReturnValue(throwError(testError));

      component['start$'].subscribe((condition) => {
        expect(condition).toBeFalsy();
        expect(snackbarService.toggle).toHaveBeenCalledWith(true, $localize`:@@ivy-finexp-widget.unknownError:`, {
          duration: 5000,
        });

        done();
      });

      component['startSubject$'].next();
    });
  });

  describe('chooseBank$', () => {
    it('should call chooseBank if message type Choose', (done) => {
      jest.spyOn(component as any, 'chooseBank');

      component['chooseBank$'].subscribe(() => {
        expect(component['chooseBank']).toHaveBeenCalled();

        done();
      });
      component['messageSubject$'].next({ type: MessageType.Choose } as any);
    });
  });

  describe('buttonConfig', () => {
    it('should get dark config', (done) => {
      component['isUserThemeDark'] = true;
      component.buttonConfig$.subscribe((config) => {
        expect(config).toEqual({
          styles: {
            backgroundColor: component['defaultColors'].bgDark,
            color: component['defaultColors'].textDark,
          },
          logo: null,
        });

        done();
      });

      component['messageSubject$'].next({ type: MessageType.Choose } as any);
    });
    it('should get light config', (done) => {
      component['isUserThemeDark'] = false;
      component.buttonConfig$.subscribe((config) => {
        expect(config).toEqual({
          styles: {
            backgroundColor: component['defaultColors'].bgLight,
            color: component['defaultColors'].textLight,
          },
          logo: null,
        });

        done();
      });

      component['messageSubject$'].next({ type: MessageType.Choose } as any);
    });
  });

  describe('savedBank', () => {
    it('should get from storage saved bank', () => {
      jest.spyOn(storageService, 'get').mockReturnValue(JSON.stringify(chooseBankMessage));
      expect(component.savedBank).toEqual(chooseBankMessage);
    });
  });

  describe('settings', () => {
    it('should get settings from service', (done) => {
      jest.spyOn(ivyService, 'getSettings').mockReturnValue(of(flowSettingsFixture()));
      component['settings$'].subscribe((settings) => {
        expect(settings).toEqual(flowSettingsFixture());
        done();
      });
    });
  });
});
