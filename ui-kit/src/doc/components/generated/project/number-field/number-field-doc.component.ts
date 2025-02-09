import { Component } from '@angular/core';

@Component({
  selector: 'doc-number-field',
  templateUrl: './number-field-doc.component.html'
})
export class NumberFieldDocComponent {
  numberFieldDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/number-field-example-default.component.html');
  numberFieldDefaultExampleComponent: string = require('!!raw-loader!./examples/default/number-field-example-default.component.ts');

  numberFieldLargeExampleTemplate: string = require('!!raw-loader!./examples/large/number-field-example-large.component.html');
  numberFieldLargeExampleComponent: string = require('!!raw-loader!./examples/large/number-field-example-large.component.ts');

  numberFieldRoundedExampleTemplate: string = require('!!raw-loader!./examples/rounded/number-field-example-rounded.component.html');
  numberFieldRoundedExampleComponent: string = require('!!raw-loader!./examples/rounded/number-field-example-rounded.component.ts');
}
