import { Component } from '@angular/core';
import { BadgeItem } from '../../../../../modules/badge';

@Component({
  selector: 'badge-set-doc',
  templateUrl: 'badge-set-doc.component.html',
})
export class BadgeSetDocComponent {
  htmlExample: string =  require('raw-loader!./examples/badge-set-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/badge-set-example-basic.ts.txt');

  badgeSet: BadgeItem[] = [
    { id: 1, title: 'Smart keyboard for 12.9-inch iPad' },
    { id: 2, title: 'UE Megaboon Partable' },
    { id: 3, title: 'Wireless Mouse' }
  ];
}
