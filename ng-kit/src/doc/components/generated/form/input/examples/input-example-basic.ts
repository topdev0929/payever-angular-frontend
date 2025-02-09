import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'doc-form-input-example-basic',
  templateUrl: 'input-example-basic.html'
})
export class InputDocExampleBasicComponent implements OnInit {
  demoForm: FormGroup;
  uuid: any;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.demoForm = this.fb.group({
      email: ['', [ Validators.required, Validators.email ]]
    });
  }

  onSubmit() {
    
  }
}
