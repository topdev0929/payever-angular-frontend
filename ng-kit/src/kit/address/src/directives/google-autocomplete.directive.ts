import {Directive, ElementRef, Output, EventEmitter, OnInit, Input, NgZone, Inject} from '@angular/core';

import { GoogleAutocompleteService } from '../services/google-autocomplete.service';
import { AddressInterface, AutocompleteType } from '../interfaces';

interface AddressComponentInterface {
  long_name: string;
  short_name: string;
  types: string[];
}

@Directive({
  selector: '[pe-google-autocomplete]'
})
export class GoogleAutocompleteDirective implements OnInit {

  @Input() autocompleteType: AutocompleteType = 'address';
  @Input() countriesOnly: string[] = null;
  @Output() address: EventEmitter<AddressInterface> = new EventEmitter<AddressInterface>();

  private autocomplete: any;
  private window: Window;

  constructor(
    private peGoogleAutocompleteService: GoogleAutocompleteService,
    private elementRef: ElementRef,
    private zone: NgZone,
    @Inject('Window') wind: any,
  ) {
    this.window = wind || window;
  }

  ngOnInit(): void {
    this.peGoogleAutocompleteService.onInitSubscribe(() => {
      const inputElem: HTMLElement = this.elementRef.nativeElement;

      if (this.window.google && this.window.google.maps) {
        const params: any = {
          types: [ this.autocompleteType ]
        };
        if (this.countriesOnly && this.countriesOnly.length) {
          params.componentRestrictions = { country: this.countriesOnly };
        }
        this.autocomplete = new this.window.google.maps.places.Autocomplete(inputElem, params);
        this.autocomplete.addListener('place_changed', this.change.bind(this));
        this.window.google.maps.event.addDomListener(inputElem, 'keydown', (event: KeyboardEvent) => {
          if ( event.keyCode === 13 ) {
            event.preventDefault();
          }
        });
      } else {
        console.error('Google Maps Autocomplete is not configured!');
      }
    });
  }

  change(): void {
    const addressComponents: AddressComponentInterface[] = this.autocomplete.getPlace().address_components;
    const street: string = GoogleAutocompleteDirective.parseAddressComponent('route', addressComponents);
    const streetNumber: string = ` ${GoogleAutocompleteDirective.parseAddressComponent('street_number', addressComponents)}`;
    this.zone.run(() => {
      this.address.emit({
        country: GoogleAutocompleteDirective.parseAddressComponent('country', addressComponents, 'short_name').trim(),
        city: GoogleAutocompleteDirective.parseAddressComponent('locality', addressComponents).trim(),
        zip_code: GoogleAutocompleteDirective.parseAddressComponent('postal_code', addressComponents).trim(),
        street: `${street}${streetNumber || ''}`.trim(),
        street_name: street,
        street_number: streetNumber
      });
    });
  }

  private static parseAddressComponent(name: string, components: AddressComponentInterface[], property: string = 'long_name'): string {
    for ( const component in components ) {
      if ( components[component].types.indexOf(name) !== -1 ) {
        return components[component][property];
      }
    }
    return '';
  }

}
