import {
  Component,
  HostBinding,
  Injector,
  Input,
  ViewEncapsulation,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { AbstractValueAccessorFieldComponent } from '../../../../form-core/components/abstract-value-accessor-field';

@Component({
  selector: 'pe-input-credit-card-number',
  templateUrl: 'input-credit-card-number.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCreditCardNumberComponent),
      multi: true
    }
  ]
})
export class InputCreditCardNumberComponent extends AbstractValueAccessorFieldComponent {

  @HostBinding('class.pe-input') hostClass: boolean = true;
  @Input() placeholder: string;

  @Input('forceDisabled') set setForceDisabled(disabled: boolean) {
    if (disabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  cardMask: (RegExp | string)[] = [/\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/];
  private prevValue: any;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.formControl.valueChanges
      .pipe(this.takeUntilDestroyed())
      .subscribe(() => {
        this.onControlChange(this.unmask(this.formControl.value));
      });
  }

  onBlur(evt: FocusEvent): void {
    super.onBlur(evt);
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    this.formControl.setValue(value, { emitEvent: false });
  }

  protected onControlChange(value: any): void {
    this.prevValue = value;
    super.onControlChange(value);
  }

  private unmask(value: string): string {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return value.split(' ').join('').split('_').join('');
  }

}
