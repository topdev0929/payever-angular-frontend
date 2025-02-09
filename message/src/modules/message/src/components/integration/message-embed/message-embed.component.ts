import {
  Component, ChangeDetectionStrategy, Inject, OnInit, ViewEncapsulation, HostBinding,
  ChangeDetectorRef,
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { tap, delay, filter, take, takeUntil } from 'rxjs/operators';

import { PE_OVERLAY_DATA, PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { EnvironmentConfigInterface, EnvService, PE_ENV, PeDestroyService } from '@pe/common';
import { PeMessageChannelFormComponent } from '../../channel/message-channel-form/message-channel-form.component';
import { TranslateService } from '@pe/i18n-core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'pe-message-embed',
  templateUrl: './message-embed.component.html',
  styleUrls: ['./message-embed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageEmbedComponent implements OnInit {

  channelList = this.peOverlayData.channelList;

  embedLinks = this.formBuilder.group({
    channels: [],
  });

  embedHTMLCode = '';
  embedTextButton = this.translateService.translate('message-app.message-integration.copy-embed');
  copied = false;

  newChannel = (): void => {
    const onCloseSubject$ = new Subject<any>();
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        theme: this.peOverlayData.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.channel.overlay.title'),
        theme: this.peOverlayData.theme,
      },
      panelClass: 'pe-message-channel-form-overlay',
      component: PeMessageChannelFormComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

  @HostBinding('class.pe-message-embed') peMessageEmbed = true;

  constructor(
    private envService: EnvService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface,
  ) {
  }

  ngOnInit(): void {
    this.channelList = this.peOverlayData.channelList.map((channel: any) => {
      return {
        label: channel.title,
        value: channel._id,
      };
    });

    this.embedHTMLCode = this.embedCode([this.channelList[0]]);

    this.embedLinks.valueChanges.pipe(
      tap((list) => {
        if (list.channels.length > 0) {
          this.embedHTMLCode = this.embedCode(list.channels);
        } else {
          this.embedHTMLCode = this.embedCode([this.channelList[0]]);
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  embedCode(list: any): string {
    return `<script>
  var channels = '[${list.map((item: any) => `"${item.value}"`)}]';
  var business = '${this.envService.businessId}';
  var script = document.createElement('script');
  script.src = '${this.environmentConfigInterface.custom.widgetsCdn}/message/widget.min.js';
  document.head.appendChild(script);
</script>`;
  }

  copyEmbed(embedCode: HTMLTextAreaElement): void {
    if (!this.copied) {
      embedCode.select();
      document.execCommand('copy');
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
