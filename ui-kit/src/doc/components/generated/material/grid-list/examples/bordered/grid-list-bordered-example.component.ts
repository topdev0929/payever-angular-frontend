import { Component } from '@angular/core';

@Component({
  selector: 'doc-grid-list-bordered-example',
  templateUrl: './grid-list-bordered-example.component.html'
})
export class GridListBorderedExampleComponent {
  tiles = [
    {text: 'One', cols: 3, rows: 1},
    {text: 'Two', cols: 1, rows: 2},
    {text: 'Three', cols: 1, rows: 1},
    {text: 'Four', cols: 2, rows: 1},
  ];
}
