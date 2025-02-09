import { Component } from '@angular/core';

@Component({
  selector: 'doc-mat-table',
  templateUrl: './table-mat-doc.component.html'
})
export class TableMatDocComponent {
  tableDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/table-example-default.component.html');
  tableDefaultExampleComponent: string = require('!!raw-loader!./examples/default/table-example-default.component.ts');
}
