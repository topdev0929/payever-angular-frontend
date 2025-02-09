import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subject } from 'rxjs/index';
import { take, tap } from 'rxjs/operators';

import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { TranslateService } from '@pe/i18n-core';

import { PeMessageService, PeMessageApiService } from '../../../services';
import { PeMessageIntegrationSettings } from '../../../enums';
import {
PeMessageSettingsThemeItem,
PeMessageSettingsThemeItemValues,
PeMessageBubble,
PeMessageChannel,
} from '../../../interfaces';

import { PeMessageAppearanceComponent } from '../message-appearance';
import { PeMessageChannelType } from '../../../enums/message-channel-type.enum';
import { PeMessageChatType } from '../../../enums/message-chat-type.enum';

@Component({
  selector: 'pe-message-integration-root',
  templateUrl: './message-integration-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageIntegrationRootComponent implements OnInit {

  theme = 'dark';

  constructor(
    public dialog: MatDialog,
    private peMessageService: PeMessageService,
    private peMessageApiService: PeMessageApiService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.openAppearanceOverlay();
  }

  private openAppearanceOverlay(): void {
    const onCloseSubject$ = new Subject<any>();
    const prevSettings: PeMessageSettingsThemeItemValues = Object.assign({}, this.peMessageService.currSettings.settings);
    const prevBubble: PeMessageBubble = Object.assign({}, this.peMessageService.bubble);
    const pervSettingsName: string = this.peMessageService.currSettings.name || 'default';

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClick: () => {
        this.confirmDialogAppearance(prevSettings, pervSettingsName, prevBubble);
      },
      component: PeMessageAppearanceComponent,
      data: {
        onCloseSubject$,
        theme: this.theme,
      },
      backdropClass: 'appearance-backdrop',
      panelClass: 'appearance-widget-panel',
      headerConfig: {
        title: this.translateService.translate('message-app.message-interface.integration'),
        theme: 'dark',
        backBtnTitle: this.translateService.translate('message-app.message-interface.cancel'),
        backBtnCallback: () => {
          this.confirmDialogAppearance(prevSettings, pervSettingsName, prevBubble);
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => { },
        doneBtnTitle: this.translateService.translate('message-app.message-interface.done'),
        doneBtnCallback: this.saveSettingsWidget.bind(this),
      },
    };

    onCloseSubject$.pipe(
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();

    this.peMessageApiService.getChannelList().pipe(
      tap((channelList: PeMessageChannel) => {
        config.data.channelList = channelList?.filter(
          (channel: PeMessageChannel) =>
            channel.subType as PeMessageChannelType === PeMessageChannelType.Integration
            && channel.type !== PeMessageChatType.AppChannel
            && channel.type !== PeMessageChatType.IntegrationChannel,
        );

        if (config.data.channelList?.length > 0) {
          this.peOverlayWidgetService.open(config);
        } else {
          this.informAboutEmptyPublicChannelList();
        }
      }),
    ).subscribe();
  }

  private dismissChangesInAppearance(
    prevSettings: PeMessageSettingsThemeItemValues,
    pervSettingsName: string, prevBubble: PeMessageBubble): void {

    this.router.navigate(['../'], { relativeTo: this.route });
    this.peOverlayWidgetService.close();

    this.changeIntegrationSettingsState(prevSettings, pervSettingsName);

    this.peMessageService.currSettings.settings.defaultPresetColor = 0;
    this.peMessageService.currSettings.settings.customPresetColors =
      this.peMessageService.currSettings.settings.customPresetColors.filter(item => !item.newItem);

    this.peMessageService.bubble = prevBubble;
  }

  private confirmDialogAppearance(
    prevSettings: PeMessageSettingsThemeItemValues,
    pervSettingsName: string, prevBubble: PeMessageBubble): void {

    const config: MatDialogConfig<any> = {
      data: {
        theme: this.theme,
        title: this.translateService.translate('message-app.message-integration.dismiss-changes'),
        cancelButtonTitle: this.translateService.translate('message-app.message-integration.confirm'),
        confirmButtonTitle: this.translateService.translate('message-app.message-integration.cancel'),
      },
      panelClass: 'dialog-dismiss-integration-changes',
    };
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, config);
    dialogRef.afterClosed().subscribe((dismiss: boolean | undefined) => {
      if (dismiss === undefined) {
        this.dismissChangesInAppearance(prevSettings, pervSettingsName, prevBubble);
      }

      this.peMessageService.isLiveChat = false;
      this.peMessageService.isEmbedChat = false;
    });
  }

  private informAboutEmptyPublicChannelList(): void {
    const config: MatDialogConfig<any> = {
      data: {
        theme: this.theme,
        title: this.translateService.translate('message-app.message-integration.not-exist-integration-channel'),
        subtitle: this.translateService.translate('message-app.message-integration.create-integration-channel'),
        cancelButtonTitle: this.translateService.translate('message-app.message-integration.cancel'),
        confirmButtonTitle: this.translateService.translate('message-app.message-integration.new-channel'),
      },
      panelClass: 'dialog-empty-integration-channel',
    };
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, config);
    dialogRef.afterClosed().subscribe((create: boolean | undefined) => {
      if (create) {
        this.router.navigate(['../channel'], { relativeTo: this.route });
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  private saveSettingsWidget(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
    this.peOverlayWidgetService.close();

    this.saveTheme();
    this.saveBubble();
  }

  saveBubble(): void {
    const bubble = this.peMessageService.bubble;
    const bubbleClear: PeMessageBubble = {
      bgColor: PeMessageIntegrationSettings.bubbleBgColor,
      textColor: PeMessageIntegrationSettings.bubbleTextColor,
      ...bubble,
    };
    delete bubbleClear.businessDocument;
    delete bubbleClear.business;
    delete bubbleClear._id;
    delete bubbleClear.__v;
    this.peMessageApiService.patchBubble(bubbleClear).pipe(take(1)).subscribe();
  }

  saveTheme(): void {
    // clean preset colors from useless variables
    this.peMessageService.currSettings.settings.customPresetColors =
      this.peMessageService.currSettings.settings.customPresetColors.map(({ _id, newItem, ...item }) => item);

    // set up default preset colors on head of stack
    const defaultPresetColor = this.peMessageService.currSettings.settings.defaultPresetColor;
    if (defaultPresetColor && defaultPresetColor > 0) {
      const currentSettings = this.peMessageService.currSettings;
      const defaultCPC = this.peMessageService.currSettings.settings.customPresetColors.splice(defaultPresetColor, 1);
      currentSettings.settings.customPresetColors =
        [...defaultCPC, ...this.peMessageService.currSettings.settings.customPresetColors];

      this.peMessageService.currSettings = currentSettings;
      this.peMessageService.currSettings.settings.defaultPresetColor = 0;
    }

    this.changeIntegrationSettingsState(
      this.peMessageService.currSettings.settings,
      this.peMessageService.currSettings.name as string
    );

    const themeItem: PeMessageSettingsThemeItem = this.peMessageService.currSettings;
    const themeItemClear: PeMessageSettingsThemeItem = {
      isDefault: themeItem.isDefault,
      settings: themeItem.settings,
    };

    this.peMessageApiService.patchSettings(themeItemClear, (themeItem._id || 'default')).pipe(take(1)).subscribe();
  }

  changeIntegrationSettingsState(settings: PeMessageSettingsThemeItemValues, settingsName: string): void {
    this.peMessageService.settings.themes?.forEach( (mItem: PeMessageSettingsThemeItem) => {
      mItem.isDefault = mItem.name === settingsName;
      if (mItem.name === settingsName) {
        mItem.settings = settings;
        this.peMessageService.currSettings = mItem;
      }
    });
  }
}
