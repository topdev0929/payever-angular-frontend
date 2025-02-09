import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  DashboardMenuItem
} from './dashboard-menu.interface';

@Component({
  selector: 'pe-dashboard-menu',
  styleUrls: ['dashboard-menu.component.scss'],
  templateUrl: 'dashboard-menu.component.html'
})

export class DashboardMenuComponent implements AfterViewInit {

  defaultNotificationIconId = '#icon-n-indicator-16';

  @Input() menuItems: DashboardMenuItem[];

  @Output('selectItemEvent') selectItemEvent: EventEmitter<MouseEvent> = new EventEmitter();

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewInit() {
    this.init();
  }

  getBackground(image: string): any {
    return this.sanitizer.bypassSecurityTrustStyle(`url(${image})`);
  }

  onItemSelect(event: MouseEvent, item: DashboardMenuItem): void {
    this.selectItemEvent.emit(event);
    if ( typeof item.onSelect === 'function') {
      item.onSelect(event , item);
    }
  }

  private init() {
    const notificationItemWithoutIcon = this.menuItems.find((item: DashboardMenuItem) =>
      ((item.iconNotificationCount !== undefined) && (item.iconNotificationId === undefined)));

    if (notificationItemWithoutIcon) {
      notificationItemWithoutIcon.iconNotificationId = this.defaultNotificationIconId;
    }
  }
}
