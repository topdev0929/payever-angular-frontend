import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebCountryPickerComponent } from './country-picker';

export const COUNTRY_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PebCountryPickerDirective),
  multi: true,
};

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'peb-country-picker[formControlName], peb-country-picker[formControl], peb-country-picker[ngModel]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { '(changed)': 'onChange($event)', '(touched)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [COUNTRY_VALUE_ACCESSOR],
})
export class PebCountryPickerDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PebCountryPickerComponent) {}
  writeValue(value: any): void {
    this.host.addedCountries = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
