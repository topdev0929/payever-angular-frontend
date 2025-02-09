import { ChangeDetectorRef, Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { PebProductPickerComponent } from './product-picker';

export const PRODUCT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PebProductPickerDirective),
  multi: true,
};

@Directive({
  selector: 'peb-product-select[formControlName], peb-product-select[formControl], peb-product-select[ngModel]',
  host: { '(changed)': 'onChange($event)', '(touched)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [PRODUCT_VALUE_ACCESSOR],
})
export class PebProductPickerDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PebProductPickerComponent, private cdr: ChangeDetectorRef) {}
  writeValue(value: any): void {
    this.onChange(value);
    this.host.addedItems = cloneDeep(value) || [];
    this.cdr.detectChanges();
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
