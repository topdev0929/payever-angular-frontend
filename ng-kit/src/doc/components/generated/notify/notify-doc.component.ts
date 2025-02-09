import { Component, ComponentRef } from '@angular/core';
import { NotificationService, NotificationItemConfig, NotificationItemDefaultConfig, NotificationComponent } from '../../../../kit/notification';
import { TestNotificationComponent } from './test-notification.component';

@Component({
  selector: 'doc-notify',
  templateUrl: 'notify-doc.component.html'
})
export class NotifyDocComponent {

  exampleTs1: string = `
// make sure that your root AppComponent has viewContainerRef provider
export class AppComponent {
  constructor(public viewContainerRef: ViewContainerRef) {
  }
}`;

  exampleTs2: string = `
// use NotificationService in basic version with message
import { NotificationService } from '@pe/ng-kit/modules/notification';
...

this.notificationService.createNotification({
  message: 'Hello from server!'
});
`;

  exampleTs3: string = `
// or more extended config:
this.notificationService.createNotification({
  message: 'Hello from server!',
  icon: 'alert',
  timeOut: 10000,
  position: 'bottom-right'
});
`;

  exampleTs4: string = `
// for new style - dark style
// to add links to the notification message just markup the message as there was a regular 'a' tag and pass to configs Links array wth corresponding selector of 'a' tag.

  onLinkEventTest($link: any) {
    alert('testing Link Event');
    
  }
  onLinkEventTestTwo($link: any) {
    alert('testing Link Event Two');
    
  }

  makeCenterNotification() {
    this.notificationService.createNotification({
      showCloseBtn: false,
      position: 'top-center',
      timeOut: 10000,
      style: 'dark',
      dynamicComponent: YourCustomComponent, // if you are passing YourCustomComponent then no need to pass 'message', you should take care of messages and links inside YourCustomComponent
      message: 'Golden dock 24 Native...was added to your bag.',
    });
  }

  makeMiddleNotification() {
    let notificationComponentRef = this.notificationService.createNotification({
      showCloseBtn: false,
      svgIconId: '#icon-db-store-24',
      svgIconClass: 'icon-24',
      message: 'Added',
      position: 'center-center',
      timeOut: 1000,
      style: 'dark',
    });
  }

  // use NotificationItemConfig

  makeDefaultUiNotification() {
     this.notificationService.createUiNotification({
       message: 'From native Union store',
       subtitle: 'Orders',
       title: '3 new orders',
       createdDate: '17:45',
       timeOut: 1000,
       hideCloseBtn: false,
       isNotViewed: true,
       position: 'bottom-left'
     });
  }

`;

  exampleTs5: string = `
  // For NotificationItem, the new style notification please use  'notificationService.createUiNotification' method
  // NotificationItemConfig used as config interface

  // example
  makeDefaultUiNotification() {
     this.notificationService.createUiNotification({
       message: 'From native Union store',
       subtitle: 'Orders',
       title: '3 new orders',
       createdDate: '17:45',
       timeOut: 1000,
       hideCloseBtn: false,
       isNotViewed: true,
       position: 'bottom-left',
     });
  }

  // default values
  NotificationItemDefaultConfig: NotificationItemConfig = {
    message: '',
    theme: 'dark',
    position: 'top-right',
    timeOut: 5000,
    iconSize: 16,
  }
  `;

  constructor(private notificationService: NotificationService) {}

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

  makeDefaultNotification(): void {
     this.notificationService.createNotification({
       message: 'Hello from server!'
     });
  }

  makeWarningNotification(): void {
    this.notificationService.createNotification({
      message: 'Hello from server!',
      icon: 'alert',
      timeOut: 1000,
      position: 'bottom-left'
    });
  }

  makeCenterNotification(): void {
    const notificationComponentRef: ComponentRef<NotificationComponent> = this.notificationService.createNotification({
      showCloseBtn: false,
      position: 'top-center',
      timeOut: 1000,
      style: 'dark',
      dynamicComponent: TestNotificationComponent
    });
  }

  makeMiddleNotification(): void {
    const notificationComponentRef: ComponentRef<NotificationComponent> = this.notificationService.createNotification({
      showCloseBtn: false,
      svgIconId: '#icon-db-store-24',
      svgIconClass: 'icon-24',
      message: 'Added',
      position: 'center-center',
      timeOut: 1000,
      style: 'dark'
    });
  }

  makeDefaultUiNotification(): void {
    this.notificationService.createUiNotification({
      message: 'From native Union store',
      subtitle: 'Orders',
      title: '3 new orders',
      createdDate: '17:45',
      timeOut: 10000,
      hideCloseBtn: false,
      isNotViewed: true,
      iconId: '#icon-alert-24',
      iconSize: 64,
      position: 'top-right'
    });
  }
}

