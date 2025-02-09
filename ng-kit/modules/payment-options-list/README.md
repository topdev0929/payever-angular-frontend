# Import module
```typescript
import { PaymentOptionsListModule } from '@pe/ng-kit/modules/payment-options-list';
import { PaymentOptionsListItem } from '@pe/ng-kit/modules/payment-options-list';

```

## PaymentOptionsListComponent
Selector:
- payment-options-list

Params:
- itemsList: PaymentOptionsListItem[];

### Usage
````html
<pe-payment-options-list [itemsList]="paymentOptions" (selectItemEvent)="onSelectItem($event)"></pe-payment-options-list>
````
### SpotlightService
import { SpotlightService } from '@pe/ng-kit/modules/spotlight';

Emits:
- selectItemEvent (emits PaymentOptionsListItem)
