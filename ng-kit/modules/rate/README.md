# Import module
```typescript
import { RateModule } from '@pe/ng-kit/modules/rate';
```
## RateComponent
Selector:
- pe-rate

Params:
- rateAmount: string
- rateOptions: RateOption[]
- isSelected: boolean;

Event Emits:
- onSelect (boolean)

### Usage
````ts
import { RateOption } from '@pe/ng-kit/modules/rate';

rateOptions: RateOption[] = [
  { label: 'Months', val: '1 Month' },
  ...
];

handleRateSelect(isSelected: boolean) {
  console.log('handling rate selected', isSelected);
}
````

````html
<pe-rate
  rateAmount="75,50&nbsp;NOK"
  [rateOptions]="rateOptions"
  [isSelected]="true"
  (onSelect)="handleRateSelect($event)"
  >
</pe-rate>
````
