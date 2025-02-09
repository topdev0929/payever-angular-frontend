import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AddressInterface } from '../../../../../../kit/form';

@Component({
  selector: 'doc-autocomplete-google-places-example',
  templateUrl: 'autocomplete-google-places-example.component.html'
})
export class AutocompleteGooglePlacesExampleDocComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      address: ['Aarti Street Number 11, Dhebar Road South, Atika Industrial Area, Bhakti Nagar, Rajkot, Gujarat, India', Validators.required]
    });
  }

  onAddressChanged(address: AddressInterface): void {
    
  }

  onSubmit() {
    
  }
}
