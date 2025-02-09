import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: 'pe-coupons-checkbox',
  templateUrl: './coupons-checkbox.component.html',
  styleUrls: ['./coupons-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PeCouponsCheckboxComponent),
    }
  ]
})
export class PeCouponsCheckboxComponent implements ControlValueAccessor {

  @ViewChild('input', { static: true }) elementRef: ElementRef;

  @Input() name: string;
  @Input() value: string;

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  writeValue(value: any): void {
    this.elementRef.nativeElement.checked = value;
  }

  onChange: (value: any) => void = () => {};
  onTouched = () => {};
}
