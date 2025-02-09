import { Component, Output, EventEmitter, ViewEncapsulation, Injector, Input } from '@angular/core';

import { AddressService } from '../../../../address';
import { AbstractInputComponent } from '../../../input';
import { AddressInterface, GooglePlacesAutocompleteChangeEvent } from '../../interfaces';

@Component({
  selector: 'pe-autocomplete-google-places',
  templateUrl: 'autocomplete-google-places.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AutocompleteGooglePlacesComponent extends AbstractInputComponent {

  @Input() countriesOnly: string[];
  @Output() valueChange: EventEmitter<GooglePlacesAutocompleteChangeEvent> = new EventEmitter<GooglePlacesAutocompleteChangeEvent>();

  constructor(protected injector: Injector, private addressService: AddressService) {
    super(injector);
  }

  onAddressChanged(data: AddressInterface): void {
    const addressString: string = this.addressService.getAddressString(data);
    this.formControl.setValue(addressString);
    this.valueChange.emit({
      value: addressString,
      address: data
    });
  }
}
