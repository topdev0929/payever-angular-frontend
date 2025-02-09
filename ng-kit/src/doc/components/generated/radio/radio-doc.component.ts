import { Component } from '@angular/core';

@Component({
  selector: 'doc-radio',
  templateUrl: 'radio-doc.component.html'
})
export class RadioDocComponent {

  radioDefaultExampleTemplate: string = require('!!raw-loader!./examples/radio-default-example/radio-default-example.component.html');
  radioDefaultExampleComponent: string = require('!!raw-loader!./examples/radio-default-example/radio-default-example.component.ts');
}
