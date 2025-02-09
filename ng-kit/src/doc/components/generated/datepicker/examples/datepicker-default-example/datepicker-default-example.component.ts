import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'doc-datepicker-default-example',
  templateUrl: 'datepicker-default-example.component.html'
})
export class DatepickerDefaultExampleDocComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [new Date(), Validators.required]
    });
  }

  onSubmit() {
    
  }
}
