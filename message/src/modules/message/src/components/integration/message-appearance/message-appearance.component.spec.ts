import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { PeDestroyService, PE_ENV } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { Subject } from 'rxjs';
import { PeMessageService } from '../../../services';
import { PeMessageAppearanceComponent } from './message-appearance.component';

describe('PeMessageAppearanceComponent', () => {

  let fixture: ComponentFixture<PeMessageAppearanceComponent>;
  let component: PeMessageAppearanceComponent;
  let peMessageService: jasmine.SpyObj<PeMessageService>;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject<void>();

    const peMessageServiceMock = {
      settings: {
        currentTheme: null,
        themes: null,
      },
      currSettings: {
        settings: {
          defaultPresetColor: null,
          customPresetColors: null,
          bgChatColor: null,
          messagesBottomColor: null,
          accentColor: null,
        },
      },
      currSettings$: new Subject(),
      bubble: {
        showBubble: true,
        style: 'rounded',
      },
    };

    const peOverlayDataMock = {
      theme: 'dark',
    };

    const envServiceMock = {
      custom: {
        cdn: 'c-cdn',
      },
    };

    TestBed.configureTestingModule({
      declarations: [PeMessageAppearanceComponent],
      providers: [
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
        { provide: PE_ENV, useValue: envServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageAppearanceComponent);
      component = fixture.componentInstance;

      peMessageService = TestBed.inject(PeMessageService) as jasmine.SpyObj<PeMessageService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set props on construct', () => {

    expect(component.theme).toEqual('dark');
    expect(component.currentTheme).toBeNull();
    expect(component.mockUps).toEqual([]);
    expect(component.defaultPresetColor).toBe(0);
    expect(component.showBubbleVal).toBe(true);
    expect(component.styleVal).toEqual('rounded');

  });

  it('should get color boxes', () => {

    /**
     * peMessageService.currSettings.settings.customPresetColors is null
     */
    expect(component.colorBoxes).toBeNull();

    /**
     * peMessageService.currSettings.settings.customPresetColors is [] (empty array)
     */
    peMessageService.currSettings.settings.customPresetColors = [];

    expect(component.colorBoxes).toEqual([
      { accentColor: '#636363' },
      {
        accentColor: '#2ea6ff',
        messagesBottomColor: '#2ea6ff',
      },
      { accentColor: '#f83b4c' },
      { accentColor: '#ff7517' },
      { accentColor: '#eba23a' },
      { accentColor: '#28b327' },
      { accentColor: '#02c2ed' },
      { accentColor: '#7748ff' },
      { accentColor: '#ff5da3' },
    ]);

    /**
     * peMessageService.currSettings.settings.customPresetColors is set
     */
    peMessageService.currSettings.settings.customPresetColors = [{ accentColor: '#333333' }];

    expect(component.colorBoxes).toEqual([{ accentColor: '#333333' }]);

  });

  it('should handle ng init', fakeAsync(() => {

    const markSpy = spyOn(component[`changeDetectorRef`], 'markForCheck');

    component.swiperColorBoxes = false;
    component.ngOnInit();

    (peMessageService.currSettings$ as Subject<any>).next(null);

    tick();

    expect(component.swiperColorBoxes).toBe(true);
    expect(markSpy).toHaveBeenCalled();

  }));

  it('should emit changes', () => {

    const color = '#333333';

    function generateThemeitem() {
      return {
        settings: {
          bgChatColor: null,
          messagesBottomColor: null,
          accentColor: null,
          customPresetColors: [
            {
              bgChatColor: '#999999',
              messagesBottomColor: '#777777',
              accentColor: '#555555',
            },
            {
              bgChatColor: null,
              messagesBottomColor: null,
              accentColor: null,
            },
          ],
        },
      };
    }

    component.color = color;
    component.defaultPresetColor = 1;

    /**
     * component.sidebarColorSettingsIndex is null
     */
    let themeItem = generateThemeitem();
    peMessageService.currSettings = themeItem as any;

    component.sidebarColorSettingsIndex = null as any;
    component.emitChanges();

    expect(themeItem).toEqual({
      settings: {
        bgChatColor: null,
        messagesBottomColor: null,
        accentColor: color,
        customPresetColors: [
          {
            bgChatColor: '#999999',
            messagesBottomColor: '#777777',
            accentColor: '#555555',
          },
          {
            bgChatColor: null,
            messagesBottomColor: null,
            accentColor: color,
          },
        ],
      },
    } as any);

    /**
     * component.sidebarColorSettingsIndex is 0
     */
    themeItem = generateThemeitem();
    peMessageService.currSettings = themeItem as any;

    component.sidebarColorSettingsIndex = 0;
    component.emitChanges();

    expect(themeItem).toEqual({
      settings: {
        bgChatColor: null,
        messagesBottomColor: null,
        accentColor: color,
        customPresetColors: [
          {
            bgChatColor: '#999999',
            messagesBottomColor: '#777777',
            accentColor: '#555555',
          },
          {
            bgChatColor: null,
            messagesBottomColor: null,
            accentColor: color,
          },
        ],
      },
    } as any);

    /**
     * component.sidebarColorSettingsIndex is 1
     */
    themeItem = generateThemeitem();
    peMessageService.currSettings = themeItem as any;

    component.sidebarColorSettingsIndex = 1;
    component.emitChanges();

    expect(themeItem).toEqual({
      settings: {
        bgChatColor: color,
        messagesBottomColor: null,
        accentColor: null,
        customPresetColors: [
          {
            bgChatColor: '#999999',
            messagesBottomColor: '#777777',
            accentColor: '#555555',
          },
          {
            bgChatColor: color,
            messagesBottomColor: null,
            accentColor: null,
          },
        ],
      },
    } as any);

    /**
     * component.sidebarColorSettingsIndex is 2
     */
    themeItem = generateThemeitem();
    peMessageService.currSettings = themeItem as any;

    component.sidebarColorSettingsIndex = 2;
    component.emitChanges();

    expect(themeItem).toEqual({
      settings: {
        bgChatColor: null,
        messagesBottomColor: color,
        accentColor: null,
        customPresetColors: [
          {
            bgChatColor: '#999999',
            messagesBottomColor: '#777777',
            accentColor: '#555555',
          },
          {
            bgChatColor: null,
            messagesBottomColor: color,
            accentColor: null,
          },
        ],
      },
    } as any);

  });

  it('should change sidebar color tab', () => {

    let settings: {
      bgChatColor: string | null,
      messagesBottomColor: string | null,
      accentColor: string | null,
    } = {
      bgChatColor: null,
      messagesBottomColor: null,
      accentColor: null,
    };

    peMessageService.currSettings.settings = settings as any;

    /**
     * argument index is null
     * settings.accentColor is null
     */
    component.color = '';
    component.changeSidebarColorTab(null as any);
    expect(component.color).toEqual('#ffffff');

    /**
     * settings.accentColor is set
     */
    settings.accentColor = '#333333';

    component.changeSidebarColorTab(null as any);
    expect(component.color).toEqual('#333333');

    /**
     * argument index is 0
     * settings.accentColor is null
     */
    settings.accentColor = null;

    component.changeSidebarColorTab(0);
    expect(component.color).toEqual('#ffffff');

    /**
     * settings.accentColor is set
     */
    settings.accentColor = '#333333';

    component.changeSidebarColorTab(0);
    expect(component.color).toEqual('#333333');

    /**
     * argument index is 1
     * settings.bgChatColor is null
     */
    component.changeSidebarColorTab(1);
    expect(component.color).toEqual('#ffffff');

    /**
    * settings.bgChatColor is set
    */
    settings.bgChatColor = '#444444';

    component.changeSidebarColorTab(1);
    expect(component.color).toEqual('#444444');

    /**
     * argument index is 2
     * settings.messagesBottomColor is null
     */
    component.changeSidebarColorTab(2);
    expect(component.color).toEqual('#ffffff');

    /**
     * settings.messagesBottomColor is set
     */
    settings.messagesBottomColor = '#555555';

    component.changeSidebarColorTab(2);
    expect(component.color).toEqual('#555555');

  });

  it('should select color', () => {

    const emitSpy = spyOn(component, 'emitChanges');
    const color = '#333333';

    component.colorSelect(color);

    expect(component.color).toEqual(color);
    expect(emitSpy).toHaveBeenCalled();

  });

  it('should open color picker', () => {

    const themeItem: {
      settings: {
        accentColor: string | null,
        bgChatColor: string | null,
        messagesBottomColor: string | null,
      },
    } = {
      settings: {
        accentColor: null,
        bgChatColor: null,
        messagesBottomColor: null,
      },
    };
    const boxColor = {
      accentColor: '#555555',
      bgChatColor: '#444444',
      messagesBottomColor: '#333333',
    };

    peMessageService.currSettings = themeItem as any;

    /**
     * argument boxColor is null
     * argument index is 13
     */
    component.openColorPicker({ boxColor: null, index: 13 });

    expect(component.defaultPresetColor).toBe(13);
    expect(themeItem.settings).toEqual({
      accentColor: '#ffffff',
      bgChatColor: '#ffffff',
      messagesBottomColor: '#ffffff',
    });

    /**
     * argument boxColor is set
     */
    component.defaultPresetColor = 0;
    component.openColorPicker({ boxColor: boxColor, index: 13 });

    expect(component.defaultPresetColor).toBe(13);
    expect(themeItem.settings).toEqual(boxColor);

    /**
     * argument index is -1
     */
    peMessageService.currSettings.settings.customPresetColors = [{ accentColor: '#aaaaaa' }];

    component.defaultPresetColor = 13;
    component.openColorPicker({ boxColor: null, index: -1 });

    expect(component.defaultPresetColor).toBe(0);
    expect(component.sidebarContainerIndex).toBe(1);
    expect(component.color).toEqual('#ffffff');
    expect(peMessageService.currSettings.settings.customPresetColors).toEqual([
      {
        accentColor: '#ffffff',
        newItem: true,
      },
      { accentColor: '#aaaaaa' },
    ]);

    /**
     * argument index is 13
     * component.defaultPresetColor is 13
     * peMessageService.currSettings.settings.accentColor is undefined
     */
    peMessageService.currSettings.settings.accentColor = undefined;

    component.defaultPresetColor = 13;
    component.color = '';
    component.openColorPicker({ boxColor: null, index: 13 });

    expect(component.sidebarContainerIndex).toBe(1);
    expect(component.color).toEqual('#ffffff');

    /**
     * peMessageService.currSettings.settings.accentColor is set
     */
    peMessageService.currSettings.settings.accentColor = '#999999';

    component.color = '';
    component.openColorPicker({ boxColor: null, index: 13 });

    expect(component.color).toEqual('#999999');

  });

  it('should select mockup', () => {

    const mockup = {
      isDefault: false,
      name: 'Theme 1',
      settings: null,
    };

    /**
     * mockup.settings is null
     * peMessageService.currSettings is null
     */
    peMessageService.currSettings = null as any;

    component.mockUps = [{ isDefault: true }] as any;
    component.currentTheme = null as any;
    component.defaultPresetColor = null as any;
    component.bgChatColor = null as any;
    component.swiperColorBoxes = true;
    component.selectMockUp(mockup as any);

    expect(component.mockUps.every(m => m.isDefault === false)).toBe(true);
    expect(mockup.isDefault).toBe(true);
    expect(component.currentTheme).toEqual(mockup.name);
    expect(component.defaultPresetColor).toBe(0);
    expect(component.bgChatColor).toEqual('');
    expect(component.swiperColorBoxes).toBe(false);
    expect(peMessageService.currSettings).toEqual(mockup as any);

    /**
     * mockup.settings is set
     */
    mockup.settings = {
      defaultPresetColor: 2,
      bgChatColor: '#333333',
    } as any;

    component.selectMockUp(mockup as any);

    expect(component.defaultPresetColor).toBe(2);
    expect(component.bgChatColor).toEqual('#333333');

    /**
     * setting correct peMessageService.currSettings to prevent error on destroy
     */
    peMessageService.currSettings.settings = { defaultPresetColor: 0 } as any;

  });

  it('should show and select style bubble', () => {

    const bubble = {
      showBubble: false,
      style: '',
    };

    peMessageService.bubble = bubble as any;

    /**
     * show bubble
     */
    component.showBubble(true);

    expect(bubble.showBubble).toBe(true);

    /**
     * select style
     */
    component.selectStyleBubble('rounded');

    expect(bubble.style).toEqual('rounded');

  });

  it('should change sidebar container', () => {

    const currSettings = {
      settings: {
        customPresetColors: [
          { accentColor: '#333333' },
          { accentColor: '#222222' },
          { accentColor: '#111111' },
        ],
        defaultPresetColor: 1,
      },
    };

    peMessageService.currSettings = currSettings;

    /**
     * component.sidebarContainerIndex is 1
     */
    component.sidebarContainerIndex = 1;
    component.defaultPresetColor = 13;
    component.swiperColorBoxes = true;
    component.changeSidebarContainer();

    expect(component.swiperColorBoxes).toBe(true);
    expect(component.defaultPresetColor).toBe(13);
    expect(currSettings.settings.customPresetColors).toEqual([
      { accentColor: '#333333' },
      { accentColor: '#222222' },
      { accentColor: '#111111' },
    ]);

    /**
     * component.sidebarContainerIndex is 0
     * component.defaultPresetColor is 1
     */
    component.sidebarContainerIndex = 0;
    component.defaultPresetColor = 1;
    component.changeSidebarContainer();

    expect(component.swiperColorBoxes).toBe(false);
    expect(component.defaultPresetColor).toBe(0);
    expect(currSettings.settings.customPresetColors).toEqual([
      { accentColor: '#222222' },
      { accentColor: '#333333' },
      { accentColor: '#111111' },
    ]);

  });

});
