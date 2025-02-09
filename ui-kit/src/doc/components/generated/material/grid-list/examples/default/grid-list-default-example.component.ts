import { Component } from '@angular/core';

@Component({
  selector: 'doc-grid-list-default-example',
  templateUrl: './grid-list-default-example.component.html'
})
export class GridListDefaultExampleComponent {
  tiles = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];
}
