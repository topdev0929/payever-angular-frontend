# Import module
```typescript
import { ShortcutsModule } from '@pe/ng-kit/modules/shortcuts';
```
## ShortcutsComponent
Selector:
- pe-shortcuts

Params:
- itemsList: ShortcutsItem[]
- itemsPerView: number;

Event Emits:
- onLinkClick

### Usage
````ts
import { ShortcutsComponent } from '@pe/ng-kit/modules/shortcuts';
import { ShortcutsItem, ShortcutsItemLinks } from '@pe/ng-kit/modules/shortcuts';

appsList: ShortcutsItem[] = [
  {
    title: 'Payments',
    desc: 'Add a new product',
    iconPng: require('@pe/ng-kit/icons-db/icon-payments-colored-32.png'),
    links: [
      { id: 1, title: 'ipsum dolor sit amet' },
      { id: 2, title: 'voluptatem accusantium' },
      { id: 3, title: 'consequuntur magni dolores eos' },
    ]
  },
  ...
]

handleLinkClick($item: ShortcutsItemLinks) {
  console.log('handling link click', $item);
};
````

````html
<pe-shortcuts
  [itemsList]="appsList"
  [itemsPerView]="4"
  (onLinkClick)="handleLinkClick($event)"
  >
</pe-shortcuts>
````
