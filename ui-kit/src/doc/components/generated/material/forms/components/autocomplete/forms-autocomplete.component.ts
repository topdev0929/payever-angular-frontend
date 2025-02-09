import { Component } from '@angular/core';

@Component({
    selector: 'forms-autocomplete',
    templateUrl: 'forms-autocomplete.component.html'
})
export class FormsAutocompleteMatDocComponent {
  formsAutocompleteExampleTemplate: string = require('!!raw-loader!./examples/default/forms-autocomplete-example-default.component.html');
  formsAutocompleteExampleComponent: string = require('!!raw-loader!./examples/default/forms-autocomplete-example-default.component.ts');
}
