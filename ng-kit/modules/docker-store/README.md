# Import module

```typescript
import { DockerStoreModule, IDockerStoreItem } from '@pe/ng-kit/docker-pos';
```

# Usage

Create items list for docker:

```typescript
let itemsList: IDockerStoreItem[] = [
  {
    title: 'Store Front',
    iconId: '#icon-settings-terminal-48',
    onSelect: () => {
      alert('Clicked');
    }
  },
  ...
]
```

Add docker:

````html
    <pe-docker-store [itemsList]="itemsList"></pe-docker-store>
````
