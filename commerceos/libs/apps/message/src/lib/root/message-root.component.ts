import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Subject } from 'rxjs';
import { takeUntil, tap } from "rxjs/operators";

import { APP_TYPE, AppType, EnvService, MessageBus, PreloaderState } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { CosMessageBus } from "@pe/message";
import { MessageBusEvents } from "@pe/message/shared";
import { WallpaperService } from '@pe/wallpaper';

import { PeMessageHeaderService } from '../services/message-header.service';

@Component({
  selector: 'cos-message-root',
  templateUrl: './message-root.component.html',
  styleUrls: [
    './message-root.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosMessageRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};


  @ViewChild('settingsMenu') settingsMenu!: TemplateRef<any>;

  settingsMenuOverlayRef: OverlayRef;
  settingsMenuItems = [
    {
      icon: '#icon-connect-block-16',
      title: this.translateService.translate('message-app.message-interface.connect'),
      onClick: () => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/message/connect`);
      },
    },
    {
      icon: '#icon-world-20',
      title: this.translateService.translate('message-app.message-interface.integration'),
      onClick: () => {
        this.router.navigateByUrl(`business/${this.envService.businessId}/message/integration`);
      },
    },
  ];

  destroyed$ = new Subject<boolean>();

  constructor(
    public router: Router,
    private translateService: TranslateService,
    private overlay: Overlay,
    private envService: EnvService,
    private viewContainerRef: ViewContainerRef,
    private wallpaperService: WallpaperService,
    private peMessageHeaderService: PeMessageHeaderService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Inject(MessageBus) private messageBus: CosMessageBus<MessageBusEvents>,
  ) {}

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  ngOnInit() {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
    ]);

    this.peMessageHeaderService.init();

    this.messageBus.listen(MessageBusEvents.OpenSetting).pipe(
      tap(() => {
        this.openOverlaySettingsMenu();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.peMessageHeaderService.destroy();
    sessionStorage.removeItem('current_chat_id');
    sessionStorage.removeItem('current_chats_draft');
  }

  private openOverlaySettingsMenu(): void {
    this.settingsMenuOverlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .left('51px')
        .top('51px'),
      hasBackdrop: true,
      backdropClass: 'pe-message-settings-menu-backdrop',
    });

    this.settingsMenuOverlayRef.backdropClick().subscribe(() => this.settingsMenuOverlayRef.dispose());
    this.settingsMenuOverlayRef.attach(new TemplatePortal(this.settingsMenu, this.viewContainerRef));
  }

  public closeMenu() {
    this.settingsMenuOverlayRef.dispose();
  }
}
