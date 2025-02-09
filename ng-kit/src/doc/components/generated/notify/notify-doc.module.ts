import { NgModule } from '@angular/core';
import { NotifyDocComponent } from './notify-doc.component';
import { TestNotificationComponent } from './test-notification.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { NotificationModule } from '../../../../kit/notification/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    NotificationModule
  ],
  declarations: [
    NotifyDocComponent,
    TestNotificationComponent
  ]
})
export class NotifyDocModule {
}
