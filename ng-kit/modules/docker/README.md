# Import module

```typescript
import { DockerModule } from '@pe/ng-kit/docker';
import { DockerDesktopItemInterface, DockerMobileItemInterface } from '@pe/ng-kit/docker';
```

# Usage

Create items list for docker:

```typescript
const desktopItemsBeforeSeparator: DockerDesktopItemInterface = [
    {
      name: 'Application',
      src: '../../../../../icons-apps/payment_options.png',
      alt: 'Title',
      isNotificationExist: true,
      onSelect: () => {
        alert('Hi!');
      }
    },
    {
      name: 'Application',
      src: '../../../../../icons-apps/my_stores.png',
      alt: 'Title'
    },
    {
      name: 'Application',
      src: '../../../../../icons-apps/transactions.png',
      alt: 'Title'
    }
];

const desktopItemsAfterSeparator: DockerDesktopItemInterface = [
    {
      name: 'Application',
      src: '../../../../../icons-apps/communication.png',
      alt: 'Title',
      onSelect: () => {
        alert('Clicked!');
      }
    },
    {
      name: 'Application',
      src: '../../../../../icons-apps/settings.png',
      alt: 'Title'
    }
];

const mobileItems: DockerMobileItemInterface = [
    {
      icon: '#icon-dock-orders-24',
      name: 'Orders',
      onSelect: () => {
        alert('Hi!');
      }
    },
    {
      icon: '#icon-dock-stores-24',
      name: 'Stores',
      isNotificationExist: true
    },
    {
      icon: '#icon-dock-products-24',
      name: 'Products'
    },
    {
      icon: '#icon-dock-messenger-24',
      name: 'Messenger'
    }
];
```

Add docker:

````html
<pe-docker
    [desktopItemsBeforeSeparator]="desktopItemsBeforeSeparator"
    [desktopItemsAfterSeparator]="desktopItemsAfterSeparator"
    [mobileItems]="mobileItems"
    [mobileAppsItemName]="'Apps'"
></pe-docker>
````

## Events
- mobileAppsButtonClick
