# Import module
```typescript
import { PaymentOptionModule } from '@pe/ng-kit/modules/payment-option';
```
## PaymentOptionComponent
Selector:
- pe-payment-option

Params:
- title: string;
- linkTitle: string;
- iconPng: string; (you can use require(../image.png); )
- hasSwitch: boolean;
- switchOn: boolean;

Event Emits:
- onSwitchToggle (Boolean)
- onLinkClick (Event)

### Usage
````ts
iconPng = require('../../../assets/img/9bfd251af24107ac3bcf2a41b5ba0228.png');
handleSwitchToggle(switchOn: boolean) {
  console.log('handling switch toggle', switchOn);
}

handleLinkClick(e: Event) {
  console.log('handling link click', e);
}
````

````html
<pe-payment-option
  title="SOFORT Banking"
  linkTitle="Edit"
  [iconPng]="iconPng"
  [hasSwitch]="true"
  [switchOn]="true"
  (onSwitchToggle)="handleSwitchToggle($event)"
  (onLinkClick)="handleLinkClick($event)"
  ></pe-payment-option>
````
