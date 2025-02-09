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

const CHAR: RegExp = /[a-zA-Z0-9]/;

@Component({
  selector: 'pe-input-iban',
  templateUrl: 'input-iban.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputIbanComponent),
      multi: true
    }
  ]
})
export class InputIbanComponent extends AbstractValueAccessorFieldComponent {

  @HostBinding('class.pe-input') hostClass: boolean = true;
  @Input() placeholder: string;

  @Input('forceDisabled') set setForceDisabled(disabled: boolean) {
    if (disabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  // Examples:
  //  DE 12 5001 0517 0648 4898 90
  //  NI 92 BAMC 0000 0000 0000 0000 0312 3123
  //  SC 52 BAHL 0103 1234 5678 9012 3456 USD
  //  QA 54 QNBA 0000 0000 0000 6931 2345 6
  //  MU 43 BOMM 0101 1234 5678 9101 000M UR
  //  BR 15 0000 0000 0000 1093 2840 814P 2
  //  AL 35 2021 1109 0000 0000 0123 4567
  // https://www.iban.com/structure
  char: RegExp = /[a-zA-Z0-9]/;
  cardMask: (RegExp | string)[] = [
    /[a-zA-Z]/, /[a-zA-Z]/, ' ', /\d/, /\d/, ' ',
    CHAR, CHAR, CHAR, CHAR, ' ', CHAR, CHAR, CHAR, CHAR, ' ',
    CHAR, CHAR, CHAR, CHAR, ' ', CHAR, CHAR, CHAR, CHAR, ' ',
    CHAR, CHAR, CHAR, CHAR, ' ', CHAR, CHAR, CHAR, CHAR, ' ',
    CHAR, CHAR, CHAR, CHAR, ' ', CHAR, CHAR, CHAR, CHAR, ' ',
    CHAR, CHAR, CHAR, CHAR, ' ', CHAR, CHAR, CHAR, CHAR
  ];
  private prevValue: any;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.formControl.valueChanges
      .pipe(this.takeUntilDestroyed())
      .subscribe(() => {
        const raw: string = this.formControl.value || '';
        const upper: string = raw.toUpperCase();
        if (upper !== raw) {
          this.formControl.setValue(upper);
        } else {
          this.onControlChange(this.unmask(this.formControl.value));
        }
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
