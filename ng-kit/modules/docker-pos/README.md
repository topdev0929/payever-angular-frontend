# Import module

```typescript
import { DockerPosModule } from '@pe/ng-kit/docker-pos';
import { IDockerPosItem } from '@pe/ng-kit/docker-pos';
```

# Usage

Create items list for docker:

```typescript
let itemsList: IDockerPosItem[] = [
  {
    title: 'Home',
    iconId: '#icon-home-2-24',
    isCurrent: true,
    onSelect: () => {
      alert('Home clicked');
    }
  },
  ...
  { //isDisabled will disable item
    title: 'Disabled',
    iconId: '#icon-checkout-24',
    isDisabled: true,
  },
  ...
  { //Last item will fixed on right side of docker, isHidden will hide item
     title: 'Code',
     iconId: '#icon-dots-h-24',
     isHidden: true,
   },
]
```

Add docker:

````html
    <pe-docker-pos [itemsList]="itemsList"></pe-docker-pos>
````

## Events
- open
- skip
- onSettings
