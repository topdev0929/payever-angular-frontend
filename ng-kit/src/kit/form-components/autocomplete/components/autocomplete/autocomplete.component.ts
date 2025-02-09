import { Component, ViewEncapsulation, OnInit, Injector } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { AbstractAutocompleteComponent } from '../abstract-autocomplete';

@Component({
  selector: 'pe-autocomplete',
  templateUrl: 'autocomplete.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AutocompleteComponent extends AbstractAutocompleteComponent implements OnInit {

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.init(this.formControl);
  }

  // Autocomplete functionality

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.valueChange.emit({ value: event.option.value });
  }

}
