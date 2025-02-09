# Import module

```typescript
import { NotificationModule } from '@pe/ng-kit/modules/notification';

export class YourModule {
    imports: [
        ...
        NotificationModule
        ...
    ]
}
```

# Inject the view ref in the app component

app.component.ts:

```typescript
export class AppComponent {
  constructor(public viewContainerRef: ViewContainerRef) {}
```

## Config

- message - Default ""
- icon - Default null
- timeOut - Default 5000
- position - Default "top-right"
- showCloseBtn?: true;
- style?: 'default' | 'dark';
- dynamicComponent: Component

Config interface can be imported from @pe/ui-notification if needed

## adding additional RouterLinks or similar
- to add links to the notification message You need to create YourCustomComponent and supply it in the configs.dynamicComponent. You take care of what will be shown in this case inside of YourCustomComponent

```typescript
  import { YourCustomComponent } from './YourCustom.component';

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
```

## Create from service
Factory method:
````typescript
createNotification(config: ConfirmationDialogConfig): ComponentRef<NotificationComponent> {}
````
### Example
Import service
````typescript
import {NotificationService} from '@pe/ui-notification/src/notification.service';
````

Component
````typescript
export class MyComponent {

  constructor(private notificationService: NotificationService) {
  }

  createNotification() {
    let notificationRef = this.notificationService.createNotification({message: 'Hello from server!'});
    notificationRef.onDestroy(() => {
      console.log('closed');
    });
  }
}
````

Template
````html
    <button class="btn btn-default" (click)="createNotification()">
      Notification
    </button>
````

## Notifications for NotificationItem
### Create notification
````typescript
 this.notificationService.createUiNotification({
   message: 'From native Union store',
   subtitle: 'Orders',
   title: '3 new orders',
   createdDate: '17:45',
   timeOut: 1000,
   hideCloseBtn: false,
   isNotViewed: true,
 });
````

## Config
- title?: string;
- subtitle?: string;
- message?: string;
- theme?: ThemeType;
- iconId?: string;
- iconSize?: IconSize;
- position?: PositionType;
- timeOut?: number;
- isNotViewed?: boolean;
- createdDate?: string;
- hideCloseBtn?: boolean;

## Using 'NotificationItemComponent' as standalone

Selector: pe-notification-item

Input Params:
- config: NotificationItemConfig
- isStandalone: boolean (should be set true if you using NotificationItemComponent as via selector in template)

Event Emits:
- close
- clicked (emits link to NotificationItemComponent instance)
