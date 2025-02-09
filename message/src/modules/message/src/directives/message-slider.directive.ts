import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PeMessageSliderComponent } from '../components';

const SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PeMessageSliderDirective),
  multi: true,
};

@Directive({
  selector:
    'pe-message-slider[formControlName], pe-message-slider[formControl], pe-message-slider[ngModel]',
  host: { '(changing)': 'onChange($event)', '(changed)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [SLIDER_VALUE_ACCESSOR],
})
export class PeMessageSliderDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PeMessageSliderComponent) {}
  writeValue(value: any): void {
    this.host.value = value;
    this.host.initUnitAndValue();
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
