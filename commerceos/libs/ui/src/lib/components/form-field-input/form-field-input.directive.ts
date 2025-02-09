import { ChangeDetectorRef, Directive, ElementRef, Renderer2, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebFormFieldInputComponent } from './form-field-input';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'peb-form-field-input[formControlName], peb-form-field-input[formControl], peb-form-field-input[ngModel]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { '(input)': 'onInput($event.target.value)', '(blur)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PeFormFieldInputDirective),
      multi: true,
    },
  ],
})
export class PeFormFieldInputDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(
    private host: PebFormFieldInputComponent,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2) {}

  writeValue(obj: any): void {
    const input = this.el.nativeElement.querySelector('input');
    this.renderer.setProperty(input, 'value', obj);
    if (!obj || obj.trim() === '') {
      this.host.isAnyText = false;
      this.host.isFocused = false;
    }
    else {
      this.host.isFocused = true;
      this.host.isAnyText = true;
    }
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(value: any) {
    this.onChange(value);
  }
}
