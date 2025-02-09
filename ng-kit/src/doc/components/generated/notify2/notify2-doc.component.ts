import { Component } from '@angular/core';
import { Notification2Service } from '../../../../kit/notification2';

@Component({
  selector: 'doc-notify2',
  templateUrl: 'notify2-doc.component.html'
})
export class Notify2DocComponent {

  exampleTs1: string = `
// make sure that your root AppComponent has viewContainerRef provider
export class AppComponent {
  constructor(public viewContainerRef: ViewContainerRef) {
  }
}

// use Notification2Service in basic version with message
import { Notification2Service } from '@pe/ng-kit';
...

this.notification2Service.createNotification({
  timeN: '23:15',
  titleN: 'Notification title',
  descriptionN: 'Description',
  iconN: 'tag for img', // img or svg
  openURL: '/doc',
  openText: 'Open',
  skipText: 'Skip',
});
`;

  exampleTs2: string = `
import { Notification2Module } from '@pe/ng-kit/modules/notification2';
`;

  exampleHtml = `
<pe-notification2
    class="notify2"
    iconN="tag for img" <!-- img or svg -->
    titleN="Title of notification"
    descriptionN="Description of notification"
    openText="Open"
    skipText="Skip"
    openURL="/path/to/open"
    [settings]="true"
    (onSettings)="switchToNotifications($event)">
</pe-notification2>
`;

  constructor(private notification2Service: Notification2Service) {}

  switchToNotifications(): void {
    alert('switchToNotifications() function called');
  }

}
