import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { v4 as uuid } from 'uuid';

@Component({
    selector: 'doc-forms-checkbox-example-default',
    templateUrl: 'forms-checkbox-example-default.component.html'
})
export class FormsCheckboxDefaultComponent {

  demoForm: FormGroup;
  uuid: any;

  constructor(private fb: FormBuilder) {
    this.uuid = uuid();
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.demoForm = this.fb.group({
      checkbox: true,
      checkbox2: false,
      checkbox3: false,
    });
  }

  onSubmit() {
    console.log('on Form Submit', this.demoForm);
  }
}
