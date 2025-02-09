import { Component } from '@angular/core';

@Component({
  selector: 'doc-snack-bar',
  templateUrl: './snack-bar-doc.component.html'
})
export class SnackBarDocComponent {
  snackBarDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/snack-bar-example-default.component.html');
  snackBarDefaultExampleComponent: string = require('!!raw-loader!./examples/default/snack-bar-example-default.component.ts');
}
