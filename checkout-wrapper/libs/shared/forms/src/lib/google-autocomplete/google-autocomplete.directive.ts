/// <reference types="@types/google.maps" />
import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { take, takeUntil, tap } from 'rxjs/operators';

import { AddressInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { GoogleAutocompleteService } from './google-autocomplete.service';

@Directive({
  selector: '[peGoogleAutocomplete]',
  providers: [PeDestroyService],
})
export class GoogleAutocompleteDirective implements OnInit, OnDestroy {

  @Input() options: google.maps.places.AutocompleteOptions = {
    types: ['address'],
  };

  @Output() addressChange = new EventEmitter<AddressInterface>();

  private autocompleteListener: google.maps.MapsEventListener;

  private listeners: (() => void)[] = [];

  constructor(
    private elementRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
    private destroy$: PeDestroyService,
    private googleAutocompleteService: GoogleAutocompleteService,
  ) {}

  ngOnDestroy(): void {
    this.listeners.forEach(listener => listener());
  }

  ngOnInit(): void {
    // This disables the default google maps placeholder
    this.renderer.setAttribute(this.elementRef.nativeElement, 'placeholder', '');
    this.renderer.setAttribute(this.elementRef.nativeElement, 'autocomplete', 'off');
    this.listeners.push(
      this.renderer.listen(this.elementRef.nativeElement, 'keydown', (event: KeyboardEvent) => {
        if (['Enter', 'NumpadEnter'].includes(event.key)) {
          event.preventDefault();
        }
      }),
    );

    this.googleAutocompleteService.loadScript$.pipe(
      take(1),
      tap(() => {
        const autocomplete: google.maps.places.Autocomplete =
          new window.google.maps.places.Autocomplete(this.elementRef.nativeElement, this.options);
        this.autocompleteListener?.remove();
        this.autocompleteListener = autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const address = this.parseGoogleAddress(place.address_components);

          this.addressChange.emit(address);
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private parseGoogleAddress(addressComponents: google.maps.GeocoderAddressComponent[]): AddressInterface {
    if (!addressComponents) {
      return null;
    }

    const streetName = addressComponents.find(
      component => component.types.includes('route')
    )?.long_name.trim();
    const streetNumber = addressComponents.find(
      component => component.types.includes('street_number')
    )?.long_name.trim();
    const city = addressComponents.find(
      component => component.types.includes('locality') || component.types.includes('postal_town')
    )?.long_name.trim();
    const zipCode = addressComponents.find(
      component => component.types.includes('postal_code')
    )?.long_name.trim();
    const country = addressComponents.find(
      component => component.types.includes('country')
    )?.short_name.trim();

    return {
      city,
      country,
      fullAddress: `${streetName} ${streetNumber ?? ''}, ${city}, ${country} ${zipCode ?? ''}`.trim(),
      street: `${streetName} ${streetNumber ?? ''}`.trim(),
      streetName,
      streetNumber,
      zipCode,
    };
  }
}
