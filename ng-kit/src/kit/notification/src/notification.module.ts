import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationWrapperComponent } from './notification-wrapper/notification-wrapper.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';
import { NotificationService } from './notification.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NotificationWrapperComponent,
    NotificationComponent,
    NotificationItemComponent,
  ],
  entryComponents: [
    NotificationWrapperComponent,
    NotificationComponent,
    NotificationItemComponent,
  ],
  exports: [NotificationComponent, NotificationItemComponent],
  providers: [NotificationService]
})
export class NotificationModule {}
