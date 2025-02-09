import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectOptionInterface } from '../../../../../../kit/form-components/select/interfaces';

@Component({
  selector: 'doc-select-default-example',
  templateUrl: './select-default-example.component.html'
})
export class SelectDefaultExampleComponent implements OnInit {
  form: FormGroup;

  citiesOptions: SelectOptionInterface[] = [{
    label: 'Moscow',
    value: 'Moscow'
  }, {
    label: 'London',
    value: 'London'
  }, {
    label: 'Berlin',
    value: 'Berlin'
  }, {
    label: 'Kiev',
    value: 'Kiev'
  }, {
    label: 'Paris',
    value: 'Paris'
  }];

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      city: null
    });
  }
}
