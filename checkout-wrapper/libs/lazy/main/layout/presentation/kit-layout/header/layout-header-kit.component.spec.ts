import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomElementService } from '@pe/checkout/utils/src';

import { HeaderSettings } from '../../../models';

import { LayoutHeaderKitComponent } from './layout-header-kit.component';

describe('LayoutHeaderKitComponent', () => {

  let component: LayoutHeaderKitComponent;
  let fixture: ComponentFixture<LayoutHeaderKitComponent>;

  let customElementService: CustomElementService;
  const mockLoadIcons = jest.fn();
  (window as any).PayeverStatic = {
    SvgIconsLoader: {
      loadIcons: mockLoadIcons,
    },
  };

  const settings: HeaderSettings = {
    stylesActive: true,
    logo: {
      url: 'url',
      alignment: 'left',
    },
    fullWidth: true,
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        CustomElementService,
      ],
      declarations: [
        LayoutHeaderKitComponent,
      ],
    });

    customElementService = TestBed.inject(CustomElementService);

    fixture = TestBed.createComponent(LayoutHeaderKitComponent);
    component = fixture.componentInstance;

    component.settings = settings;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  describe('Constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });

    it('should load icons on create', () => {
      expect(mockLoadIcons).toHaveBeenCalledWith(['arrow-left-ios-24'], null, customElementService.shadowRoot);
    });
  });

  describe('Inputs', () => {
    it('should handle default value', () => {
      expect(component.settings).toEqual(settings);
      expect(component.fullWidth).toBeTruthy();
      expect(component.hideLogo).toBeFalsy();
    });
  });

  describe('shouldShowLogoAt', () => {
    it('should shouldShowLogoAt return true', () => {
      expect(component.settings.logo.alignment).toEqual('left');
      expect(component.hideLogo).toBeFalsy();
      expect(component.shouldShowLogoAt('left')).toBeTruthy();
    });

    it('should shouldShowLogoAt handle null alignment', () => {
      component.settings = {
        ...settings,
        logo: {
          ...settings.logo,
          alignment: null,
        },
      };
      expect(component.settings.logo.alignment).toEqual(null);
      expect(component.hideLogo).toBeFalsy();
      expect(component.shouldShowLogoAt('left')).toBeTruthy();
    });

    it('should shouldShowLogoAt return false if hideLogo true', () => {
      component.hideLogo = true;
      expect(component.settings.logo.alignment).toEqual('left');
      expect(component.hideLogo).toBeTruthy();
      expect(component.shouldShowLogoAt('left')).toBeFalsy();
    });

    it('should shouldShowLogoAt returns false if the alignment does not match', () => {
      expect(component.settings.logo.alignment).toEqual('left');
      expect(component.hideLogo).toBeFalsy();
      expect(component.shouldShowLogoAt('right')).toBeFalsy();
    });
  });
});
