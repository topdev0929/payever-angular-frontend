import { Component } from '@angular/core';

@Component({
  selector: 'forms-input',
  templateUrl: 'forms-input.component.html'
})
export class FormsInputMatDocComponent {
  formsInputExampleTemplate: string = require('!!raw-loader!./examples/default/forms-input-example-default.component.html');
  formsInputExampleComponent: string = require('!!raw-loader!./examples/default/forms-input-example-default.component.ts');

  formsInputSearchTemplate: string = require('!!raw-loader!./examples/search/forms-input-example-search.component.html');
  formsInputSearchComponent: string = require('!!raw-loader!./examples/search/forms-input-example-search.component.ts');
}
