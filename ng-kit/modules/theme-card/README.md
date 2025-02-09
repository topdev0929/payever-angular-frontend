# Import module
```typescript
import { ThemeCardModule } from '@pe/ng-kit/modules/theme-card';
```


## ThemeCardComponent
Selector:
- pe-theme-card

Params:
- uuid: string
- title: string
- subTitle: string
- image: string
- actions: ThemeCardActions[]

Output:
- onClick : emits string;


### Usage
````ts
import { ThemeCardComponent, ThemeCardActions } from '../../../../../modules/theme-card';

image: string = require('../../../assets/img/background_jpg_ed4f73.jpg');
cardActions: ThemeCardActions[] = [
  {label: 'action 1', onSelect: (uuid) => { console.log('action 1', uuid )} },
  {label: 'action 2', onSelect: (uuid) => { console.log('action 2', uuid )} },
]
````

````html
<pe-theme-card
  [uuid]="'id-123'"
  [title]="'Minimal'"
  [subTitle]="'Installed'"
  [image]="image"
  [actions]="cardActions"
  (onClick)="handleCardClick($event)"
  ></pe-theme-card>
````
