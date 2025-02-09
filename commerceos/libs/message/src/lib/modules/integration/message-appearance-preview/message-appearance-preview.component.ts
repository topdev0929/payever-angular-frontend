import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewEncapsulation, Input,
} from '@angular/core';
import { delay, filter, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeMessageIntegrationThemeItem } from '@pe/message/shared';

import { PeMessageConversationService, PeMessageIntegrationService } from '../../../services';
import { PeMessageThemeService } from '../../../services/message-theme.service';

@Component({
  selector: 'pe-message-appearance-preview',
  templateUrl: './message-appearance-preview.component.html',
  styleUrls: ['./message-appearance-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class MessageAppearancePreviewComponent implements OnInit {

  blurMode: boolean;

  @Input() channels!: string;
  @Input() business!: string;

  constructor(
    public peMessageThemeService: PeMessageThemeService,
    public peMessageService: PeMessageIntegrationService,
    private changeDetectorRef: ChangeDetectorRef,
    private destroyed$: PeDestroyService,
    private peMessageConversationService: PeMessageConversationService,
  ) { }

  ngOnInit(): void {
    this.peMessageService.currSettings$.pipe(
      filter((themeItem: PeMessageIntegrationThemeItem) => themeItem._id !== undefined),
      tap((themeItem: PeMessageIntegrationThemeItem) => {
        this.peMessageConversationService.isLoading$.next(true);
        this.blurMode = themeItem.settings.messageWidgetBlurValue?.length > 0;
        this.changeDetectorRef.detectChanges();
      }),
      delay(100),
      tap(() => this.peMessageConversationService.isLoading$.next(false)),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
