import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { Icons } from '../../root/icons';

@Component({
  selector: 'pe-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessagesComponent {
  @Input() hasItems = false;
  @Input() notifications?: string;

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('message-icon', sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${Icons['message-icon']}`));
  }
}
