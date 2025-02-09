import { Component } from '@angular/core';

@Component({
  selector: 'doc-table',
  templateUrl: './table-doc.component.html'
})
export class TableDocComponent {

  tsExample: string = require('!!raw-loader!./examples/table-doc-default-example/table-doc-default-example.component.ts');
  htmlExample: string = require('!!raw-loader!./examples/table-doc-default-example/table-doc-default-example.component.html');
}
