import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'doc-forms-autocomplete-example-default',
    templateUrl: 'forms-autocomplete-example-default.component.html'
})
export class FormsAutocompleteDefaultComponent {
  city = new FormControl('', [
    Validators.required
  ]);

  cities = ['Berlin', 'Paris', 'Moscow'];
}
