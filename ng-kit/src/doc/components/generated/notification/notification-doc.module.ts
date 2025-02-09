import { NgModule } from '@angular/core';
import { NotificationDocComponent } from './notification-doc.component';
import { NotificationItemDocComponent } from './notification-item-doc.component';
import { NotificationWrapperDocComponent } from './notification-wrapper-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { NotificationModule } from '../../../../kit/notification/src';

@NgModule({
  imports: [
    DocComponentSharedModule,
    NotificationModule
  ],
  declarations: [
    NotificationDocComponent,
    NotificationItemDocComponent,
    NotificationWrapperDocComponent
  ]
})
export class NotificationDocModule {
}
