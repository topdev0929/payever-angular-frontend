import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { Icons } from '../../root/icons';

@Component({
  selector: 'pe-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeNotificationsComponent {
  @Input() hasItems = false;

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('notification-icon', sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${Icons['notification-icon']}`));
    iconRegistry.addSvgIcon('notification-circle-icon', sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${Icons['notification-circle-icon']}`));
  }
}
