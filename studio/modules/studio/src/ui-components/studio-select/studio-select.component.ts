import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface Option {
  label: string;
  value: string | number;
}

@Component({
  selector: 'pe-studio-select',
  templateUrl: './studio-select.component.html',
  styleUrls: ['./studio-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StudioSelectComponent),
      multi: true,
    },
  ],
})
export class StudioSelectComponent implements ControlValueAccessor {
  @Input() options = [];
  @Input() placeholder = 'Choose item';

  public value: Option;
  public isDropdownShown = false;

  private propagateOnChange = (value: Option) => {};
  private propagateTouched = (value: Option) => {};

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  writeValue(value: Option): void {
    this.value = value;
    this.cdr.detectChanges();
  }

  registerOnChange(fn): void {
    this.propagateOnChange = fn;
  }

  registerOnTouched(fn): void {
    this.propagateTouched = fn;
  }

  public setValue(option: Option): void {
    this.value = option;
    this.propagateOnChange(this.value);
    this.propagateTouched(this.value);
    this.isDropdownShown = false;
  }

  public showDropdown(): void {
    this.isDropdownShown = true;
  }
}
