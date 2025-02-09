import {
  Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Inject,
  ChangeDetectorRef, OnDestroy, HostBinding, ElementRef, AfterViewInit,
} from '@angular/core';
import { takeUntil, tap, delay } from 'rxjs/operators';

import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n-core';
import { EnvService, PeDestroyService } from '@pe/common';

import {
  PeMessageSettingsThemeItem,
  PeMessageColorLayout,
} from '../../../interfaces';
import { PeMessageService } from '../../../services';
import { PeMessageColorTabs, PeMessageIntegrationSettings } from '../../../enums';

@Component({
  selector: 'pe-message-appearance',
  templateUrl: './message-appearance.component.html',
  styleUrls: ['./message-appearance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageAppearanceComponent implements OnInit, AfterViewInit, OnDestroy {

  @HostBinding('class.pe-message-appearance') peMessageAppearance = true;

  theme = this.peOverlayData.theme;
  color!: string;
  label!: string;

  bubbleBackgroundColor = '';
  bubbleTextColor = '';
  bgChatColor = '';

  sidebarWidgetSettingsMode = [
    this.translateService.translate('message-app.message-integration.widget'),
    this.translateService.translate('message-app.message-integration.bubble'),
  ];

  sidebarContainerIndex = 0;
  sidebarColorSettingsIndex = 0;
  sidebarWidgetSettingsIndex = 0;

  currentTheme = this.peMessageService.settings.currentTheme;

  colorTabs = [PeMessageColorTabs.AccentColor, PeMessageColorTabs.Background, PeMessageColorTabs.Message];

  mockUps: PeMessageSettingsThemeItem[] = this.peMessageService.settings.themes || [];

  defaultPresetColor = this.peMessageService.currSettings.settings.defaultPresetColor || 0;
  shadowColor = this.peMessageService.currSettings.settings.messageWidgetShadow || '';

  showMessageShadow = false;

  colorBoxes = this.peMessageService.currSettings.settings.customPresetColors;

  channels = `["${this.peOverlayData.channelList[0]._id}"]`;
  business = this.envService.businessId;
  swiperColorBoxes = false;

  logo = this.peOverlayData.logo;

  backButton!: HTMLElement;
  backBtnCallback!: () => void;
  doneBtnCallback!: () => void;

  constructor(
    public peMessageService: PeMessageService,
    private destroyed$: PeDestroyService,
    private peMessageAppearanceRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private envService: EnvService,
    private translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
  ) {
  }

  ngOnInit(): void {
    this.backBtnCallback = this.overlayConfig.backBtnCallback;
    this.doneBtnCallback = this.overlayConfig.doneBtnCallback;

    this.peMessageService.liveChatBubbleClickedStream$.next(true);

    this.peMessageService.currSettings$.pipe(
      delay(200),
      tap((settings: PeMessageSettingsThemeItem) => {
        this.swiperColorBoxes = true;
        this.changeDetectorRef.markForCheck();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngAfterViewInit(): void {
    const widgetPopup = this.peMessageAppearanceRef.nativeElement.closest('.appearance-widget-panel');
    this.backButton = widgetPopup.querySelector('.overlay-widget__back');
  }

  secondLevelSettings(): void {
    this.backButton.innerHTML = this.translateService.translate('message-app.message-integration.back');
    this.overlayConfig.backBtnCallback = this.backToSettings.bind(this);
    this.overlayConfig.doneBtnCallback = this.backToSettings.bind(this);
  }

  backToSettings(): void {
    this.sidebarContainerIndex = 0;
    this.backButton.innerHTML = this.translateService.translate('message-app.message-integration.cancel');
    this.overlayConfig.backBtnCallback = this.backBtnCallback;
    this.overlayConfig.doneBtnCallback = this.doneBtnCallback;
    this.sidebarColorSettingsIndex = 0;
    this.changeDetectorRef.markForCheck();
  }

  emitChanges(): void {
    const themeItem: PeMessageSettingsThemeItem = this.peMessageService.currSettings;

    switch (this.sidebarColorSettingsIndex) {
      case 1:
        themeItem.settings.bgChatColor = this.color;
        themeItem.settings.customPresetColors[this.defaultPresetColor].bgChatColor = this.color;
        break;
      case 2:
        themeItem.settings.messagesBottomColor = this.color;
        themeItem.settings.customPresetColors[this.defaultPresetColor].messagesBottomColor = this.color;
        break;
      case 0:
      default:
        themeItem.settings.accentColor = this.color;
        themeItem.settings.customPresetColors[this.defaultPresetColor].accentColor = this.color;
        break;
    }

    this.peMessageService.currSettings = themeItem;
  }

  changeSidebarColorTab(index: number): void {
    this.sidebarColorSettingsIndex = index;
    switch (this.sidebarColorSettingsIndex) {
      case 1:
        this.color = this.peMessageService.currSettings.settings.bgChatColor || PeMessageIntegrationSettings.bgChatColor;
        break;
      case 2:
        this.color = this.peMessageService.currSettings.settings.messagesBottomColor || PeMessageIntegrationSettings.messagesBottomColor;
        break;
      case 0:
      default:
        this.color = this.peMessageService.currSettings.settings.accentColor || PeMessageIntegrationSettings.accentColor;
        break;
    }
  }

  colorSelect(event: any): void {
    this.color = event;
    this.emitChanges();
  }

  openColorPicker(event: PeMessageColorLayout): void {
    const boxColor = event.boxColor;
    const index = event.index;

    if (this.defaultPresetColor === index) {
      this.sidebarContainerIndex = 1;
      this.secondLevelSettings();
      this.color = this.peMessageService.currSettings.settings.accentColor || PeMessageIntegrationSettings.accentColor;
    } else if (index === -1) {
      this.defaultPresetColor = 0;
      this.peMessageService.currSettings.settings.customPresetColors.unshift({
        accentColor: PeMessageIntegrationSettings.accentColor,
        newItem: true,
      });
      this.sidebarContainerIndex = 1;
      this.secondLevelSettings();
      this.color = PeMessageIntegrationSettings.accentColor;
    } else {
      this.defaultPresetColor = index;
      const themeItem: PeMessageSettingsThemeItem = this.peMessageService.currSettings;
      themeItem.settings.accentColor = boxColor?.accentColor || PeMessageIntegrationSettings.accentColor;
      themeItem.settings.bgChatColor = boxColor?.bgChatColor || PeMessageIntegrationSettings.bgChatColor;
      themeItem.settings.messagesBottomColor = boxColor?.messagesBottomColor || PeMessageIntegrationSettings.messagesBottomColor;
      this.peMessageService.currSettings = themeItem;
    }
  }

  selectMockUp(mockUp: PeMessageSettingsThemeItem): void {
    this.mockUps.forEach((mItem: PeMessageSettingsThemeItem) => { mItem.isDefault = false; });
    mockUp.isDefault = true;
    this.currentTheme = mockUp.name;
    this.defaultPresetColor = mockUp.settings?.defaultPresetColor || 0;
    this.bgChatColor = mockUp.settings?.bgChatColor || '';
    this.shadowColor = mockUp.settings?.messageWidgetShadow || '';
    this.swiperColorBoxes = false;

    this.peMessageService.currSettings = mockUp;

    this.changeDetectorRef.markForCheck();
  }

  changeSidebarContainer(): void {
    if (this.sidebarContainerIndex === 0) {
      this.swiperColorBoxes = false;
      const currentSettings = this.peMessageService.currSettings;
      const defaultCPC = this.peMessageService.currSettings.settings.customPresetColors.splice(this.defaultPresetColor, 1);
      currentSettings.settings.customPresetColors = [...defaultCPC, ...this.peMessageService.currSettings.settings.customPresetColors];
      this.colorBoxes = currentSettings.settings.customPresetColors;

      this.peMessageService.currSettings = currentSettings;
      this.defaultPresetColor = 0;

      this.changeDetectorRef.markForCheck();
    }
  }

  changeBoxShadow(event: string): void {
    const currSettings = this.peMessageService.currSettings;
    currSettings.settings.messageWidgetShadow = event;
    this.peMessageService.currSettings = currSettings;
  }

  done(): void {
    this.backToSettings();
  }

  switchWidgetBubble(index: number): void {
    this.sidebarWidgetSettingsIndex = index;
    this.peMessageService.liveChatBubbleClickedStream$.next(index === 0);
  }

  ngOnDestroy(): void {
    this.peMessageService.currSettings.settings.defaultPresetColor = this.defaultPresetColor;
  }
}
