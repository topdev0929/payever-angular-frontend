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
  selector: 'pe-input-credit-card-expiration',
  templateUrl: 'input-credit-card-expiration.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCreditCardExpirationComponent),
      multi: true
    }
  ]
})
export class InputCreditCardExpirationComponent extends AbstractValueAccessorFieldComponent {

  @HostBinding('class.pe-input') hostClass: boolean = true;
  @Input() placeholder: string;

  @Input('forceDisabled') set setForceDisabled(disabled: boolean) {
    if (disabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  cardMask: (RegExp | string)[] = [/\d/, /\d/, ' ' , '/' , ' ', /\d/, /\d/];
  private prevValue: number[];

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
    this.formControl.setValue(value ? this.mask(value) : value, { emitEvent: false });
  }

  protected onControlChange(value: number[]): void {
    this.prevValue = value;
    super.onControlChange(value);
  }

  private mask(value: number[]): string {
    return `${value[0] || '  '} / ${value[1] || '  '}`;
  }

  private unmask(value: string): number[] {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parts: string[] = value.split(' ').join('').split('_').join('').split('/');
    return [
      parts[0] && parts[0].length === 2 ? parseInt(parts[0], 10) : null,
      parts[1] && parts[1].length === 2 ? parseInt(parts[1], 10) : null
    ];
  }
}
