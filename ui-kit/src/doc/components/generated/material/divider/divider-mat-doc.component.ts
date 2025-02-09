import { Component } from '@angular/core';

@Component({
  selector: 'doc-mat-divider',
  templateUrl: './divider-mat-doc.component.html'
})
export class DividerMatDocComponent {
  dividerDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/divider-example-default.component.html');
  dividerDefaultExampleComponent: string = require('!!raw-loader!./examples/default/divider-example-default.component.ts');

  dividerVerticalExampleTemplate: string = require('!!raw-loader!./examples/vertical/divider-example-vertical.component.html');
  dividerVerticalExampleComponent: string = require('!!raw-loader!./examples/vertical/divider-example-vertical.component.ts');
}
