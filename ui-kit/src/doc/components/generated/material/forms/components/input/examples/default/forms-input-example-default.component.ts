import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'doc-forms-input-example-default',
    templateUrl: 'forms-input-example-default.component.html'
})
export class FormsInputDefaultComponent {
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
}
