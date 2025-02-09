# Import module
```typescript
import { BadgeModule } from '@pe/ng-kit/modules/badge';
```
## BadgeSet component
Selector:
- pe-badge-set

Params:
- badgeSet: BadgeItem[];

Event Emits:
- removeItemEvent

### Usage
````ts
badgeSet: BadgeItem[] = [
  { id: 1, title: 'Smart keyboard for 12.9-inch iPad' },
  { id: 2, title: 'UE Megaboon Partable' },
  { id: 3, title: 'Wireless Mouse' },
];
````

````html
<pe-badge-set [badgeSet]="badgeSet" (removeItemEvent)="onBadgeRemove($event)"></pe-badge-set>
````
