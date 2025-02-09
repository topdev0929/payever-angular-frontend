import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectOptionGroupInterface, SelectOptionInterface } from '../../../../../../kit/form-components/select/interfaces';

@Component({
  selector: 'doc-select-group-example',
  templateUrl: './select-group-example.component.html'
})
export class SelectGroupExampleComponent implements OnInit {
  form: FormGroup;

  citiesOptions: SelectOptionInterface[] = [{
    label: 'Moscow',
    value: 'Moscow',
    groupId: 'ru'
  }, {
    label: 'St. Petersburg',
    value: 'St. Petersburg',
    groupId: 'ru'
  }, {
    label: 'London',
    value: 'London',
    groupId: 'uk'
  }, {
    label: 'Berlin',
    value: 'Berlin',
    groupId: 'de'
  }, {
    label: 'Munich',
    value: 'Munich',
    groupId: 'de'
  }, {
    label: 'Paris',
    value: 'Paris',
    groupId: 'fr'
  }];

  countryGroup: SelectOptionGroupInterface[] = [{
      id: 'ru',
      label: 'Russia'
    }, {
      id: 'de',
      label: 'Germany'
    }, {
      id: 'fr',
      label: 'France'
    }, {
      id: 'uk',
      label: 'Great Britain',
      disabled: true
    }];

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      city: null
    });
  }
}
