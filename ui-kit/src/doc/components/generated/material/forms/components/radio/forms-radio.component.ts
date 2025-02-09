import { Component } from '@angular/core';

@Component({
  selector: 'forms-radio',
  templateUrl: 'forms-radio.component.html'
})
export class FormsRadioMatDocComponent {
  formsRadioExampleTemplate: string = require('!!raw-loader!./examples/default/forms-radio-example-default.component.html');
  formsRadioExampleComponent: string = require('!!raw-loader!./examples/default/forms-radio-example-default.component.ts');
}
