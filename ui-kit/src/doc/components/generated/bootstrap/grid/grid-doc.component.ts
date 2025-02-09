import { Component } from '@angular/core';

@Component({
  selector: 'doc-grid',
  templateUrl: './grid-doc.component.html'
})
export class GridDocComponent {
  gridDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/grid-default-example.component.html');
  gridDefaultExampleComponent: string = require('!!raw-loader!./examples/default/grid-default-example.component.ts');
  
  gridBorderedExampleTemplate: string = require('!!raw-loader!./examples/bordered/grid-bordered-example.component.html');
  gridBorderedExampleComponent: string = require('!!raw-loader!./examples/bordered/grid-bordered-example.component.ts');
}
