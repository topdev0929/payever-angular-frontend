import { Component } from '@angular/core';

import { IDockerItem } from '../../../../../modules/builder-docker';
import { BuilderDockerService } from '../../../../../modules/builder-docker';

@Component({
  selector: 'doc-builder-docker',
  templateUrl: 'builder-docker-doc.component.html',
})
export class BuilderDockerDocComponent {
  itemsList: IDockerItem[] = [];

  htmlExample: string =  require('raw-loader!./examples/builder-docker-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/builder-docker-example-basic.ts.txt');

  constructor(private builderDockerService: BuilderDockerService) {

    this.itemsList = [
      {
        title: 'Text',
        type: 'text',
        iconId: '#icon-b-text-32',
        onSelect: () => {
          alert('Text clicked');
        }
      },
      {
        title: 'Images',
        type: 'images',
        iconId: '#icon-b-image-32',
        subItems: [
          {
            title: 'Banner',
            type: 'banner',
            iconId: '#icon-b-banner-32',
            onSelect: () => {
              alert('Banner clicked');
            }
          },
          {
            title: 'Gallery',
            type: 'gallery',
            iconId: '#icon-b-gallery-32',
          },
          {
            title: 'Slider',
            type: 'slider',
            iconId: '#icon-b-slider-32',
          },
        ]
      },
      {
        title: 'Columns',
        type: 'columns',
        iconId: '#icon-b-layout-32',
      },
      {
        title: 'Spacer',
        type: 'spacer',
        iconId: '#icon-b-spacer-32',
      },
      {
        title: 'Map',
        type: 'map',
        iconId: '#icon-b-map-32',
      },
      {
        title: 'Custom',
        type: 'custom',
        iconId: '#icon-b-code-32',
      },
      {
        title: 'Products',
        type: 'products',
        iconId: '#icon-b-products-32',
        subItems: [
          {
            title: 'Product',
            type: 'product',
            iconId: '#icon-b-product-32',
          },
          {
            title: 'Featured',
            type: 'featured',
            iconId: '#icon-b-featured-32',
          },
        ]
      },
    ];

    // subscribe to item DRAG
    this.builderDockerService.itemDrag.subscribe(
      (data: Array<any>) => {
        
      }
    );

    // subscribe to item DRAG START
    this.builderDockerService.itemDragStart.subscribe(
      (data: Array<any>) => {
        
      }
    );

    // subscribe to item DRAG END
    this.builderDockerService.itemDragEnd.subscribe(
      (data: Array<any>) => {
        
      }
    );
  }

  js1: string = `
#typescript
// Import builderDocker into your module
import { BuilderDockerModule } from '@pe/ng-kit/modules/builder-docker';
import { IDockerItem } from '@pe/ng-kit/modules/builder-docker';

let itemsList: IDockerItem[] = [
  {
    title: 'Images',
    iconId: '#icon-b-image-32',
    subItems: [
      {
        title: 'Banner',
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
  `;

  html1: string = `
<!-- template -->
<!-- [width] is optional, only set if you want to override width.  -->
<pe-builder-docker [itemsList]="itemsList" [width]="'1000px'"></pe-builder-docker>
  `;

  js2: string = `
#typescript
//Listen to Drag, DragStart and DragEnd events when builder items are dragged

import { BuilderDockerService } from '@pe/ng-kit/modules/builder-docker';

export class YourComponent {

  constructor(private builderDockerService: BuilderDockerService) {
    // subscribe to item DRAG
    this.builderDockerService.itemDrag.subscribe(
      (data: Array<any>) => {
        
      }
    );

    // subscribe to item DRAG START
    this.builderDockerService.itemDragStart.subscribe(
      (data: Array<any>) => {
        
      }
    );

    // subscribe to item DRAG END
    this.builderDockerService.itemDragEnd.subscribe(
      (data: Array<any>) => {
        
      }
    );
  }
}

   `;
}
