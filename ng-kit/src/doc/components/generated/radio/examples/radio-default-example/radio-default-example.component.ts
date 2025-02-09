import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { RadioButtonInterface } from '../../../../../../kit/form';

@Component({
  selector: 'doc-radio-default-example',
  templateUrl: 'radio-default-example.component.html'
})
export class RadioDefaultExampleDocComponent implements OnInit {

  form: FormGroup;
  radioButtons: RadioButtonInterface[] = [
    {
      title: 'Option 1',
      value: '1'
    },
    {
      title: 'Option 2',
      value: '2'
    }
  ];

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      options: ['2']
    });
  }

  onSubmit() {
    
  }
}
