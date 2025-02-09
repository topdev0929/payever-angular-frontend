import { Component } from '@angular/core';

import { IDockerPosItem } from '../../../../kit';

@Component({
  selector: 'doc-docker-pos',
  templateUrl: 'docker-pos-doc.component.html',
  styleUrls: ['docker-pos-doc.component.scss'],
})
export class DockerPosDocComponent {
  htmlExample: string =  require('raw-loader!./examples/docker-pos-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/docker-pos-example-basic.ts.txt');
  cssExample: string =  require('raw-loader!./examples/docker-pos-example-basic.css.txt');
  itemsList: IDockerPosItem[] = [];

  constructor() {
    this.itemsList = [
      {
        title: 'Click me',
        iconId: '#icon-home-2-24',
        isCurrent: true,
        onSelect: () => {
          alert('Home clicked');
        }
      },
      {
        title: 'Rewards',
        iconId: '#icon-rewards-24'
      },
      {
        title: 'Disabled',
        iconId: '#icon-checkout-24',
        isDisabled: true
      },
      {
        title: 'Shop in my device',
        iconId: '#icon-device-24'
      },
      {
        title: 'Help',
        iconId: '#icon-help-24'
      },
      {
        title: 'Code',
        iconId: '#icon-dots-h-24'
      }
    ];
  }

  exampleJs: string = `
// Import into your module
import { DockerPosModule } from '@pe/ng-kit/modules/docker-pos';
import { IDockerPosItem } from '@pe/ng-kit/modules/docker-pos';

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
  `;

  html1: string = `<pe-docker-pos [itemsList]="itemsList"></pe-docker-pos>`;
}
