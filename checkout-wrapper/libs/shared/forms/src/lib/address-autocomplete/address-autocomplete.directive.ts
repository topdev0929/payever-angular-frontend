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
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { BehaviorSubject, Subject, fromEvent, merge, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { AddressInterface } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { AddressAutocompleteService } from './address-autocomplete.service';
import { AddressComponents, AddressItem } from './models';

@Directive({
  selector: '[peAddressAutocomplete][matAutocomplete]',
  providers: [
    PeDestroyService,
  ],
})
export class AddressAutocompleteDirective implements OnInit, OnDestroy {
  private placeId$ = new Subject<string>();
  private readonly loading = new BehaviorSubject<boolean>(false);

  @Input() matAutocomplete: MatAutocomplete;
  @Output() addressChange = this.placeId$.pipe(
    filter(value => Boolean(value)),
    tap(() => this.loading.next(true)),
    switchMap(value => this.addressAutocompleteService.details(value).pipe(
      map(details => this.parseGoogleAddress(details.address_components)),
    )),
    tap(() => this.loading.next(false)),
    catchError((err) => {
      this.loading.next(false);

      return throwError(err);
    }),
  );

  @Output() addressSelect = new EventEmitter<AddressInterface>();

  private listeners: (() => void)[] = [];

  constructor(
    private ngControl: NgControl,
    private elementRef: ElementRef<HTMLInputElement>,
    private renderer: Renderer2,
    @Self() private destroy$: PeDestroyService,
    private addressAutocompleteService: AddressAutocompleteService,
  ) {

  }

  ngOnDestroy(): void {
    this.listeners.forEach(listener => listener());
  }

  ngOnInit(): void {
    const matAutocompleteOptionSelected$ = this.matAutocomplete.optionSelected.pipe(
      tap((e) => {
        const address: AddressItem = e.option.value;
        this.ngControl.control.setValue(address);
        this.placeId$.next(address.placeId);
      }),
    );

    const inputEvent$ = fromEvent(this.elementRef.nativeElement, 'input').pipe(
      map(event => ((event.target as HTMLInputElement).value).trim()),
      distinctUntilChanged(),
      debounceTime(250),
      switchMap(value => this.addressAutocompleteService.search(value)),
    );

    const focusEvent$ = fromEvent(this.elementRef.nativeElement, 'focus').pipe(
      withLatestFrom(this.loading),
      filter(([ _, loading ]) => !loading),
      map(([event]) => ((event.target as HTMLInputElement).value).trim()),
      distinctUntilChanged(),
      switchMap((value) => {
        this.addressAutocompleteService.addressItems$.next([]);

        return this.addressAutocompleteService.search(value);
      })
    );

    merge(
      inputEvent$,
      focusEvent$,
      matAutocompleteOptionSelected$,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.listeners.push(
      this.renderer.listen(this.elementRef.nativeElement, 'keydown', (event: KeyboardEvent) => {
        if (['Enter', 'NumpadEnter'].includes(event.key)) {
          event.preventDefault();
        }
      }),
    );
  }

  private parseGoogleAddress(addressComponents: AddressComponents[]): AddressInterface {
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
      component => component.types.includes('postal_code') && !component.types.includes('postal_code_prefix')
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
