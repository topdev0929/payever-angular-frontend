import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PeCouponOption } from '../../interfaces/coupon-option.interface';


@Component({
  selector: 'pe-coupons-select',
  templateUrl: './coupons-select.component.html',
  styleUrls: ['./coupons-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PeCouponsSelectComponent),
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeCouponsSelectComponent implements ControlValueAccessor {

  @Input() options: any;
  
  selectedOption: string;

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  writeValue(value: any): void {
    this.selectedOption = value;
    this.changeDetectorRef.detectChanges();
  }

  onChange: (value: any) => void = () => {};
  onTouched = () => {};

  trackOption(index: number, option: PeCouponOption) {
    return option.value;
  }

}
