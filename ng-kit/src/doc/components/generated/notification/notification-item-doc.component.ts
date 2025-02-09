import { Component } from '@angular/core';
import { NotificationItemConfig, NotificationItemDefaultConfig } from '../../../../kit/notification';

@Component({
  selector: 'notification-item-doc',
  templateUrl: 'notification-item-doc.component.html'
})

export class NotificationItemDocComponent {
  standAloneNotifConfig: NotificationItemConfig = Object.assign(
    NotificationItemDefaultConfig,
    {
      message: 'From native Union store Checking started in a separate process Checking started in a separate process',
      subtitle: 'Orders Checking started in a separate process Checking started in a separate process',
      title: '3 new orders Checking started in a separate process Checking started in a separate process 3 new orders',
      createdDate: '17:45',
      timeOut: 100000,
      isNotViewed: true,
      iconId: '#icon-alert-24',
      iconSize: 16,
      isClickable: true,
      position: 'top-right'
    }
  );
}
