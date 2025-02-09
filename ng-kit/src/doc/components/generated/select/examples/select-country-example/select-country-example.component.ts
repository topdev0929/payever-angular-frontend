import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'doc-select-country-example',
  templateUrl: './select-country-example.component.html'
})
export class SelectCountryExampleComponent implements OnInit {
  form: FormGroup;
  panelHeight: number = 600;
  scrollToElement: string = 'EU';

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      city: null
    });
  }
}
