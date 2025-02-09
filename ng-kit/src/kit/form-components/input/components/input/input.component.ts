import { Component, Input, Injector } from '@angular/core';
import { takeUntil, debounce } from 'rxjs/operators';

import { InputType } from '../../../../form-core/enums';
import { AbstractInputComponent } from '../abstract-input/abstract-input.component';
import {  interval } from 'rxjs';

@Component({
  selector: 'pe-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent extends AbstractInputComponent {

  @Input() type: InputType;
  @Input() minLength: number = null;
  @Input() maxLength: number = null;
  @Input() numberMin: number = null;
  @Input() numberMax: number = null;
  @Input() numberIsInteger: boolean = false;
  @Input() showNumberControls: boolean = false;
  @Input() debounceTime: number = 0;

  constructor(protected injector: Injector) {
    super(injector);
  }

  changeNumber(increment: boolean): void {
    let value: number = this.formControl.value;
    if (increment) {
      value++;
    } else {
      value--;
    }
    this.formControl.patchValue(Math.round(value));
  }

  protected onSetFormControl(): void {
    super.onSetFormControl();
    this.formControl.valueChanges.pipe(
      debounce(() => interval(this.debounceTime)),
      takeUntil(this.destroyed$)).subscribe((value: string | number) => {
      let newValue: string = String(value);
      if (this.type === InputType.Number) {
        if (this.numberIsInteger) {
          newValue = String(parseInt(newValue, 10));
        }
        if (this.numberMin !== null && parseFloat(newValue) < this.numberMin) {
          newValue = String(this.numberMin);
        } else if (this.numberMax !== null && parseFloat(newValue) > this.numberMax) {
          newValue = String(this.numberMax);
        }
        if (this.numberMin === 0 && this.numberIsInteger) {
          // For better UI
          newValue = newValue.replace(/[^0-9]/g, '') || (value ? String(parseInt(String(value), 10)) : '');
        }
      }
      // TODO Add minLength also?
      if (this.maxLength !== null && newValue.length > this.maxLength) {
        newValue = newValue.substr(0, this.maxLength);
      }

      if (newValue !== String(value)) {
        this.formControl.setValue(newValue);
      } else {
        this.valueChange.emit({ value: value });
      }
    });
  }
}
