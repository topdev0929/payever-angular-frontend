import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';

import { AbstractFlowIdComponent } from '@pe/checkout/core';
import { SetFlow, SetParams, SetSettings } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, flowFixture } from '@pe/checkout/testing';
import { ScreenTypeEnum, WindowSizeInterface, WindowSizesService, WindowStylesService } from '@pe/checkout/window';

import { GlobalCustomStylesComponent } from './global-custom-styles.component';

describe('GlobalCustomStylesComponent', () => {

  let component: GlobalCustomStylesComponent;
  let fixture: ComponentFixture<GlobalCustomStylesComponent>;

  let store: Store;
  let windowService: WindowSizesService;
  let windowStylesService: WindowStylesService;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
    })),
  });

  const defaultParams = {
    clientMode: false,
    merchantMode: false,
  };
  const windowInfo = {
    matchedScreenType: ScreenTypeEnum.Desktop,
    isMobile: false,
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        WindowSizesService,
        WindowStylesService,
      ],
      declarations: [
        GlobalCustomStylesComponent,
      ],
    });

    windowService = TestBed.inject(WindowSizesService);
    windowStylesService = TestBed.inject(WindowStylesService);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowFixture()));
    store.dispatch(new SetParams(defaultParams));

    fixture = TestBed.createComponent(GlobalCustomStylesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  describe('Constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof AbstractFlowIdComponent).toBe(true);
    });
  });

  describe('normalizeSize', () => {
    it('should normalizeSize return correct size', () => {
      expect(component['normalizeSize']('10px', '100px')).toEqual('10px');
      expect(component['normalizeSize']('0px', '100px')).toEqual('100px');
      expect(component['normalizeSize'](null, '100px')).toEqual('100px');
      expect(component['normalizeSize'](null)).toEqual('auto');
      expect(component['normalizeSize'](undefined, '100px')).toEqual('100px');
    });
  });

  describe('initFlow', () => {
    const defaultSettings = {
      styles: {
        businessHeaderBackgroundColor: 'red',
        active: true,
      },
    };

    it('should initFlow applyStyles with correct values', () => {
      store.dispatch(new SetSettings(defaultSettings));

      const applyStyles = jest.spyOn(component as any, 'applyStyles')
        .mockReturnValue(null);
      windowService.windowSizeInfo$ = new BehaviorSubject<WindowSizeInterface>(windowInfo);

      component.initFlow();
      expect(applyStyles).toHaveBeenCalledWith(defaultSettings.styles, defaultSettings.styles.active, windowInfo);
    });

    it('should initFlow applyStyles handle if styles not found', () => {
      store.dispatch(new SetSettings(null));

      const applyStyles = jest.spyOn(component as any, 'applyStyles')
        .mockReturnValue(null);
      windowService.windowSizeInfo$ = new BehaviorSubject<WindowSizeInterface>(windowInfo);

      component.initFlow();
      expect(applyStyles).toHaveBeenCalledWith({}, undefined, windowInfo);
    });
  });

  describe('applyStyles', () => {
    it('should applyStyles handle default values', () => {
      jest.spyOn(component as any, 'normalizeSize').mockImplementation((_, defaultValue) => defaultValue);
      jest.spyOn(windowStylesService, 'matchStyle').mockReturnValue(null);
      const updatePalette = jest.spyOn(component as any, 'updatePalette')
        .mockReturnValue(null);

      component['applyStyles']({ active: false }, false, windowInfo);
      expect(updatePalette).toHaveBeenCalledWith({
          '--checkout-business-header-background-color': null,
          '--checkout-business-header-border-color': null,
          '--checkout-business-header-height': '55px',
          '--checkout-button-background-color': null,
          '--checkout-button-background-disabled-color': null,
          '--checkout-button-border-radius': null,
          '--checkout-button-secondary-background-color': null,
          '--checkout-button-secondary-background-disabled-color': null,
          '--checkout-button-secondary-border-radius': null,
          '--checkout-button-secondary-text-color': null,
          '--checkout-button-share-background-color': null,
          '--checkout-button-share-background-disabled-color': null,
          '--checkout-button-share-border-radius': null,
          '--checkout-button-share-text-color': null,
          '--checkout-button-text-color': null,
          '--checkout-header-background-color': null,
          '--checkout-header-border-color': null,
          '--checkout-header-cancel-background-color': null,
          '--checkout-header-cancel-background-disabled-color': null,
          '--checkout-header-cancel-border-radius': null,
          '--checkout-header-cancel-text-color': null,
          '--checkout-input-background-color': null,
          '--checkout-input-border-color': null,
          '--checkout-input-border-radius': null,
          '--checkout-input-text-primary-color': null,
          '--checkout-input-text-secondary-color': null,
          '--checkout-logo-margin-bottom': '5px',
          '--checkout-logo-margin-left': '0px',
          '--checkout-logo-margin-right': '0px',
          '--checkout-logo-margin-top': '5px',
          '--checkout-logo-object-position': 'left',
          '--checkout-logo-width': 'auto',
          '--checkout-page-background-color': null,
          '--checkout-page-line-color': null,
          '--checkout-page-text-primary-color': null,
          '--checkout-page-text-secondary-color': null,
        },
      );
    });
  });

});
