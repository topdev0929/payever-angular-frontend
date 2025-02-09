import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation,
} from '@angular/core';
import { of } from 'rxjs';
import { delay, take, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';

@Component({
  selector: 'pe-message-invite-link',
  templateUrl: './message-invite-link.component.html',
  styleUrls: ['./message-invite-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageInviteLinkComponent {

  inviteLink = '';
  linkTextButton = this.translateService.translate('message-app.channel.settings.copy-invite-link');
  copied = false;

  constructor(
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  copyLink(inviteLinkInput: HTMLInputElement): void {
    if (!this.copied) {
      inviteLinkInput.select();
      document.execCommand('copy');
      this.linkTextButton = this.translateService.translate('message-app.channel.settings.copied-invite-link');
      this.copied = true;

      of(null).pipe(
        delay(500),
        take(1),
        tap(() => {
          this.linkTextButton = this.translateService.translate('message-app.channel.settings.copy-invite-link');
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
