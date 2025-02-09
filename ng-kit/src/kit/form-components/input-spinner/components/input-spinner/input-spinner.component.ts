import { Component, Input, Injector, HostBinding } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { InputType } from '../../../../form-core/enums';
import { AbstractInputComponent } from '../../../input/components/abstract-input/abstract-input.component';

@Component({
  selector: 'pe-input-spinner',
  styleUrls: ['./input-spinner.component.scss'],
  templateUrl: './input-spinner.component.html'
})
export class InputSpinnerComponent extends AbstractInputComponent {

  @HostBinding('class') classes: string = 'pe-input-spinner';

  @Input() type: InputType;

  constructor(protected injector: Injector) {
    super(injector);
  }

  onDecrease(event: Event): void {
    let currValue: any = this.formControl.value;
    if (typeof currValue !== 'number') {
      try {
        currValue = Number(currValue);
      }
      catch (error) {
        currValue = 0;
      }
    }
    this.formControl.patchValue(currValue - 1);
  }
  onIncrease(event: Event): void {
    let currValue: any = this.formControl.value;
    if (typeof currValue !== 'number') {
      try {
        currValue = Number(currValue);
      }
      catch (error) {
        currValue = 0;
      }
    }
    this.formControl.patchValue((currValue as number) + 1);
  }

  protected onSetFormControl(): void {
    super.onSetFormControl();
    this.formControl.valueChanges.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((value: string | number) => {
      this.valueChange.emit({ value });
    });
  }

}
