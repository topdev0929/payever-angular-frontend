import { Component } from '@angular/core';

@Component({
  selector: 'doc-grid-list-mat',
  templateUrl: './grid-list-mat-doc.component.html'
})
export class GridListMatDocComponent {
  gridListDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/grid-list-default-example.component.html');
  gridListDefaultExampleComponent: string = require('!!raw-loader!./examples/default/grid-list-default-example.component.ts');
  
  gridListBorderedExampleTemplate: string = require('!!raw-loader!./examples/bordered/grid-list-bordered-example.component.html');
  gridListBorderedExampleComponent: string = require('!!raw-loader!./examples/bordered/grid-list-bordered-example.component.ts');
}
