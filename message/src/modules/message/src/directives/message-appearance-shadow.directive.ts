import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MessageAppearanceShadowComponent } from '../components/integration/message-appearance-shadow/message-appearance-shadow.component';

export const SHADOW_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PeMessageAppearanceShadowDirective),
  multi: true,
};

@Directive({
  selector:
    'pe-message-appearance-shadow[formControlName], pe-message-appearance-shadow[formControl], pe-message-appearance-shadow[ngModel]',
  host: { '(changed)': 'onChange($event)', '(touched)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [SHADOW_VALUE_ACCESSOR],
})
export class PeMessageAppearanceShadowDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: MessageAppearanceShadowComponent) {}
  writeValue(value: string): void {
    this.host.initShadow(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
