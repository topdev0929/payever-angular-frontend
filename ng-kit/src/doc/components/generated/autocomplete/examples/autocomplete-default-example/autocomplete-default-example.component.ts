import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'doc-autocomplete-default-example',
  templateUrl: 'autocomplete-default-example.component.html'
})
export class AutocompleteDefaultExampleDocComponent implements OnInit {

  form: FormGroup;
  options: string[] = ['Moscow', 'Berlin', 'Paris'];

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      option: ['Berlin', Validators.required]
    });
  }

  onSubmit() {
    
  }
}
