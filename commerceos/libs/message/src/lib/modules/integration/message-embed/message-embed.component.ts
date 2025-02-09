import {
  Component, ChangeDetectionStrategy, Inject, OnInit, ViewEncapsulation, HostBinding,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { tap, delay, take, takeUntil } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder/core';
import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeMessageAppApiService, PeMessageAppService } from '@pe/message/shared';
import { PE_OVERLAY_DATA, PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeMessageChat } from '@pe/shared/chat';

import { PeCreatingIntegrationChannelComponent } from '../../../components';


@Component({
  selector: 'pe-message-embed',
  templateUrl: './message-embed.component.html',
  styleUrls: ['./message-embed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageEmbedComponent implements OnInit {
  @HostBinding('class.pe-message-embed') peMessageEmbed = true;

  public channelList = [];
  private currentIntegrationsChannel$ = new BehaviorSubject<PeMessageChat[]>([]);
  set currentIntegrationsChannel(chat: PeMessageChat[]) {
    this.currentIntegrationsChannel$.next(chat);
    this.changeDetectorRef.detectChanges();
  }

  get currentIntegrationsChannel(){
    return this.currentIntegrationsChannel$.value;
  }

  embedLinks = this.formBuilder.group({
    channels: this.channelList,
  });

  embedHTMLCode = '';
  embedTextButton = this.translateService.translate('message-app.message-integration.copy-embed');
  copied = false;

  newChannel = (): void => {
    let dialogRef;
    const onSaveSubject$ = new BehaviorSubject<string>('');
    const peOverlayConfig: PeOverlayConfig = {
      hasBackdrop: true,
      headerConfig: {
        title: this.translateService.translate('message-app.message-integration.new-integration-channel'),
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.create'),
        doneBtnCallback: () => {
          onSaveSubject$.next(dialogRef);
        },
        onSave$: onSaveSubject$.asObservable(),
        onSaveSubject$,
      },
      panelClass: 'pe-message-channel-form-overlay',
      component: PeCreatingIntegrationChannelComponent,
    };
    dialogRef = this.peOverlayWidgetService.open(peOverlayConfig);
  };

  constructor(
    private envService: PebEnvService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface,
    private peMessageAppService: PeMessageAppService,
    private peMessageAppApiService: PeMessageAppApiService,
  ) {
  }

  ngOnInit(): void {
    this.peMessageAppService.getMessages().pipe(
      tap((channels) => {
        if (channels && channels.length !==0 && !channels[0].permissions.live) {
          return;
        }
        this.currentIntegrationsChannel = channels ?? [];
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.peMessageAppApiService.getChannels().pipe(
      tap(channels => this.channelList = channels.filter(
        channel => channel?.permissions && !channel.permissions?.live).map(
          channel => ({ label: channel.title, value: channel }))),

      takeUntil(this.destroy$),
    ).subscribe();

    this.currentIntegrationsChannel$.pipe(
      tap((channels) => {
        setTimeout(()=>{
          this.embedLinks.patchValue({
            channels: channels.map(channel => ({ label: channel.title, value: channel })),
          });
        });
        const channelsIds = channels.map(channel => channel._id);
        this.channelList = this.channelList.filter(channelObj => !channelsIds.includes(channelObj._id));
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.embedHTMLCode = this.embedCode();
  }

  removeChannel(channel){
    this.peMessageAppService.toggleChannelLiveStatus(channel.value, false);
  }

  addedChannel(channel){
    this.peMessageAppService.toggleChannelLiveStatus(channel.value, true);
  }


  embedCode(): string {
    return `<script>
  window.business = '${this.envService.businessId}';
  var script = document.createElement('script');
  script.src = '${this.environmentConfigInterface.custom.widgetsCdn}/message/widget.min.js';
  document.head.appendChild(script);
</script>`;
  }

  copyEmbed(embedCode: HTMLTextAreaElement): void {
    if (!this.copied) {
      embedCode.select();
      document.execCommand('copy');
      embedCode.blur();
      this.embedTextButton = this.translateService.translate('message-app.message-integration.copied');
      this.copied = true;

      of(null).pipe(
        delay(500),
        take(1),
        tap(() => {
          this.embedTextButton = this.translateService.translate('message-app.message-integration.copy-embed');
          this.copied = false;
          const selection = document.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }

          this.changeDetectorRef.detectChanges();
        }),
      ).subscribe();
    }
  }
}
