import { Component, Directive } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'doc-forms-input-example-search',
    templateUrl: 'forms-input-example-search.component.html'
})
export class FormsInputExampleSearchComponent {
  searchFormControl: FormControl = new FormControl('');
}
