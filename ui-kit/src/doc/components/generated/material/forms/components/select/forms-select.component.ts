import { Component } from '@angular/core';

@Component({
  selector: 'forms-select',
  templateUrl: 'forms-select.component.html'
})
export class FormsSelectMatDocComponent {
  formsSelectExampleTemplate: string = require('!!raw-loader!./examples/default/forms-select-example-default.component.html');
  formsSelectExampleComponent: string = require('!!raw-loader!./examples/default/forms-select-example-default.component.ts');
}
