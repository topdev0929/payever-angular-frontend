import { Component } from '@angular/core';

@Component({
  selector: 'doc-mat-spinner',
  templateUrl: './spinner-mat-doc.component.html'
})
export class SpinnerMatDocComponent {
  spinnerDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/spinner-example-default.component.html');
  spinnerDefaultExampleComponent: string = require('!!raw-loader!./examples/default/spinner-example-default.component.ts');
}
