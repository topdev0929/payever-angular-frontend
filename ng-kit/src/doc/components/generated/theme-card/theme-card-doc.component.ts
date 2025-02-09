import { Component } from '@angular/core';
import { ThemeCardActions } from '../../../../../modules/theme-card';

@Component({
  selector: 'doc-theme-card',
  templateUrl: 'theme-card-doc.component.html'
})
export class ThemeCardDocComponent {
  htmlExample: string =  require('raw-loader!./examples/theme-card-example-basic.html.txt');
  tsExample: string =  require('raw-loader!./examples/theme-card-example-basic.ts.txt');

  image: string = require('../../../assets/img/background_jpg_ed4f73.jpg');
  cardActions: ThemeCardActions[] = [
    {label: 'action 1', onSelect: (uuid: string) => null},
    {label: 'action 2', onSelect: (uuid: string) => null}
  ];

  handleCardClick(uuid: string) {
    
  }
}
