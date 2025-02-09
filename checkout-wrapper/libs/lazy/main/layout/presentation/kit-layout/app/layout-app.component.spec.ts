import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomElementService } from '@pe/checkout/utils/src';

import { LayoutAppKitComponent } from './layout-app.component';

describe('LayoutAppKitComponent', () => {

  let component: LayoutAppKitComponent;
  let fixture: ComponentFixture<LayoutAppKitComponent>;

  let customElementService: CustomElementService;

  const mockLoadIcons = jest.fn();
  (window as any).PayeverStatic = {
    SvgIconsLoader: {
      loadIcons: mockLoadIcons,
    },
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        CustomElementService,
      ],
      declarations: [
        LayoutAppKitComponent,
      ],
      schemas: [],
    });

    customElementService = TestBed.inject(CustomElementService);

    fixture = TestBed.createComponent(LayoutAppKitComponent);
    component = fixture.componentInstance;

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
      expect(mockLoadIcons).toHaveBeenCalledWith(['x-16'], null, customElementService.shadowRoot);
    });
  });

  describe('Inputs', () => {
    it('should handle default value', () => {
      expect(component.fullView).toBeFalsy();
      expect(component.staticBlockView).toBeFalsy();
      expect(component.fixedPositionView).toBeFalsy();
      expect(component.layoutWithPaddings).toBeFalsy();
    });
  });

});
