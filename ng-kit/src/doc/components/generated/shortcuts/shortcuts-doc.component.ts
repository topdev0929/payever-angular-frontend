import { Component } from '@angular/core';
import { ShortcutsItem, ShortcutsItemLinks } from '../../../../../modules/shortcuts';

@Component({
  selector: 'shortcuts-doc',
  templateUrl: 'shortcuts-doc.component.html'
})
export class ShortcutsDocComponent {
  htmlExample: string =  require('raw-loader!./examples/shortcuts-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/shortcuts-example-basic.ts.txt');

  appsList: ShortcutsItem[] = [
    {
      title: 'Payments',
      desc: 'Add a new product',
      iconPng: require('@pe/ui-kit/icons-db/icon-payments-colored-32.png'),
      links: [
        { id: 1, title: 'ipsum dolor sit amet' },
        { id: 2, title: 'voluptatem accusantium' },
        { id: 3, title: 'consequuntur magni dolores eos' },
      ]
    },
    {
      title: 'Payments',
      desc: 'Add a new product',
      iconPng: require('@pe/ui-kit/icons-db/icon-payments-colored-32.png'),
      links: [
        { id: 1, title: 'ipsum dolor sit amet' },
        { id: 2, title: 'voluptatem accusantium' },
        { id: 3, title: 'consequuntur magni dolores eos' },
      ]
    },
    {
      title: 'Payments',
      desc: 'Add a new product',
      iconPng: require('@pe/ui-kit/icons-db/icon-payments-colored-32.png'),
      links: [
        { id: 1, title: 'ipsum dolor sit amet' },
        { id: 2, title: 'voluptatem accusantium' },
        { id: 3, title: 'consequuntur magni dolores eos' },
      ]
    },
  ];

  handleLinkClick($item: ShortcutsItemLinks) {
    
  };
}
