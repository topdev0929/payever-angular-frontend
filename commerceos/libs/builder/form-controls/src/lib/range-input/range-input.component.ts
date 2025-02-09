import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Optional,
  Self,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'peb-range-input',
  template: `
    <div class="slider" [class.dynamic-color]="isDynamicColor">
      <div class="slider__track">
        <div class="slider__value" [style.width.%]="width$ | async"></div>
      </div>
      <input
        #input
        class="slider__input"
        type="range"
        aria-hidden="true"
        [min]="min"
        [max]="max"
        [step]="step"
        [value]="value$ | async"
        [disabled]="disabled"
        (input)="onInput()"
        (change)="changed()"
      />
    </div>
  `,
  styleUrls: ['./range-input.component.scss'],
})
export class PebRangeInputComponent implements ControlValueAccessor, OnChanges {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() isDynamicColor = false;

  @ViewChild('input', { static: true }) private input: ElementRef;

  private value = 0;

  onChange: (value: number) => void;
  onTouch: () => void;

  value$ = new BehaviorSubject<number>(this.max < this.min ? this.min : this.min + (this.max - this.min) / 2);
  disabled = false;

  width$ = this.value$.pipe(
    map((value: number) => {
      const clamped = Math.max(this.min, Math.min(value, this.max));

      return (clamped - this.min) / (this.max - this.min) * 100;
    }),
  );

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  @HostBinding('attr.role') role = 'slider';

  @HostListener('focusout') onFocusOut(): void {
    if (this.ngControl?.control.dirty) {
      this.onTouch();
    }
  }

  @HostBinding('attr.disabled') get isDisabled(): string | null {
    return this.disabled ? '' : null;
  }

  @HostBinding('attr.aria-valuenow') get ariaValueNow() {
    return this.value$.getValue();
  }

  @HostBinding('attr.aria-valumin') get ariaValueMin() {
    return this.min;
  }

  @HostBinding('attr.aria-valuemax') get ariaValueMax() {
    return this.max;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.min?.currentValue || changes.max?.currentValue) {
      this.value$.next(this.value);
    }
  }

  onInput(): void {
    const value = (this.input.nativeElement as HTMLInputElement).valueAsNumber;
    this.onChange(value);
    /** Update ngControl value, just in case if same formControl is bound to multiple inputs */
    this.ngControl.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: number): void {
    /**
     * Setting a value before setting max and min causes value to be is outside the initial range
     * (defined by the initial values of max and min) your value is not applied like expected.
     * Using AsyncPipe instead.
     */
    this.value = value;
    this.value$.next(value);
  }

  changed() {
    this.onTouch();
    this.onChange(this.ngControl.control.value);
  }
}
