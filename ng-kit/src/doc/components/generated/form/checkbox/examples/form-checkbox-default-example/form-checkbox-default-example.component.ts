import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'doc-form-checkbox-default-example',
  templateUrl: 'form-checkbox-default-example.component.html'
})
export class CheckboxDocDefaultExampleComponent implements OnInit {
  demoForm: FormGroup;

  constructor(private fb: FormBuilder) {
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
    
  }
}
