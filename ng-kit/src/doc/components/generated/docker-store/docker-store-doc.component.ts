import { Component } from '@angular/core';

import { IDockerStoreItem } from '../../../../kit';

@Component({
  selector: 'docker-store-doc',
  templateUrl: 'docker-store-doc.component.html',
  styleUrls: ['docker-store-doc.component.scss'],
})
export class DockerStoreDocComponent {
  htmlExample: string =  require('raw-loader!./examples/docker-store-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/docker-store-example-basic.ts.txt');
  cssExample: string =  require('raw-loader!./examples/docker-store-example-basic.css.txt');

  itemsList: IDockerStoreItem[] = [];

  constructor() {
    this.itemsList = [
      {
        title: 'Store Front',
        iconId: '#icon-settings-terminal-48',
        onSelect: () => {
          alert('Clicked');
        }
      },
      {
        title: 'Facebook',
        iconId: '#icon-facebook-48'
      },
      {
        title: 'Instagram',
        iconId: '#icon-instagram-48'
      },
      {
        title: 'Google Shop',
        iconId: '#icon-google-plus-48'
      },
      {
        title: 'Youtube',
        iconId: '#icon-youtube-48'
      }
    ];
  }

  exampleJs: string = `
// Import into your module
import { DockerStoreModule, IDockerStoreItem } from '@pe/ng-kit/docker-pos';

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
  `;

  html1: string = `<pe-docker-store [itemsList]="itemsList"></pe-docker-store>`;
}
