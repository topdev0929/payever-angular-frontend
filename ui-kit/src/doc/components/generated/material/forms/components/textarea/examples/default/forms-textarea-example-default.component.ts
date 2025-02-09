import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'doc-forms-textarea-example-default',
    templateUrl: 'forms-textarea-example-default.component.html'
})
export class FormsTextareaDefaultComponent {
  formControls: FormControl[] = [];

  constructor() {
    this.createFormControls();
  }

  private createFormControls(): void {
    for (let i = 0; i < 4; i++) {
      let formControl = new FormControl('', [
        Validators.required
      ]);
      this.formControls.push(formControl);
    }
  }
}
