import { Component } from '@angular/core';

@Component({
  selector: 'forms-textarea',
  templateUrl: 'forms-textarea.component.html'
})
export class FormsTextareaMatDocComponent {
  formsTextareaExampleTemplate: string = require('!!raw-loader!./examples/default/forms-textarea-example-default.component.html');
  formsTextareaExampleComponent: string = require('!!raw-loader!./examples/default/forms-textarea-example-default.component.ts');
}
