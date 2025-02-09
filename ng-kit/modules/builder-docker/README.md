# Builder-docker

## Usage

### Import module and IDockerItem interface
```ts
  import { BuilderDockerModule, IDockerItem } from '@pe/ng-kit/modules/builder-docker';
```

### Prepare docker items list
```ts

  let itemsList: IDockerItem[] = [
    {
      title: 'Images',
      type: 'images',
      iconId: '#icon-b-image-32',
      subItems: [
        {
          title: 'Banner',
          type: 'images',
          iconId: '#icon-b-banner-32',
          onSelect: () => {
            alert('Banner clicked');
          }
        },
        ...
      ]
    },
    ...
  ]
```

### Pass IDockerItem array to <pe-builder-docker></pe-builder-docker> selector

Template
````html
  <pe-builder-docker [itemsList]="itemsList" [width]="'1000px'"></pe-builder-docker>
````

### Listen to Drag, DragStart and DragEnd events when builder items are dragged
```ts

import { BuilderDockerService } from '@pe/ng-kit/modules/builder-docker';

export class YourComponent {

  constructor(private builderDockerService: BuilderDockerService) {
    // subscribe to item DRAG
    this.builderDockerService.itemDrag.subscribe(
      (data: Array<any>) => {
        console.log('emitting [event, IDockerItem ] from DockerService on itemDrag', data);
      }
    );

    // subscribe to item DRAG START
    this.builderDockerService.itemDragStart.subscribe(
      (data: Array<any>) => {
        console.log('emitting [event, IUiDockerItem ] from DockerService on itemDragStart', data);
      }
    );

    // subscribe to item DRAG END
    this.builderDockerService.itemDragEnd.subscribe(
      (data: Array<any>) => {
        console.log('emitting [event, IUiDockerItem ] from DockerService on itemDragEnd', data);
      }
    );
  }
}
  
```
