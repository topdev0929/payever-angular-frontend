import {
  Component,
  HostBinding,
  Inject,
  Injector,
  Input,
  ViewEncapsulation,
  forwardRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

import { LocaleConstantsService } from '../../../../i18n';
import { AbstractValueAccessorFieldComponent } from '../../../../form-core/components/abstract-value-accessor-field';

@Component({
  selector: 'pe-input-currency',
  templateUrl: 'input-currency.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCurrecyComponent),
      multi: true
    }
  ]
})
export class InputCurrecyComponent extends AbstractValueAccessorFieldComponent {

  @HostBinding('class.pe-input') hostClass: boolean = true;
  @Input() placeholder: string;
  @Input() maxLength: number;

  @Input('forceDisabled') set setForceDisabled(disabled: boolean) {
    if (disabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  numberMask: Function;
  private prevValue: any;

  constructor(protected injector: Injector,
              protected localeConstantsService: LocaleConstantsService
  ) {
    super(injector);
  }

  get thousandsSeparatorSymbol(): string {
    return this.localeConstantsService.getThousandsSeparatorSymbol();
  }

  get decimalSymbol(): string {
    return this.localeConstantsService.getDecimalSymbol();
  }

  get inputmode(): string {
    // Behaviour is always changed in mobiles. We need to have both '.' and ',' but it's getting disabled pretty often.
    // For this resason we don't use 'numeric' and 'deciminal'.
    return 'text';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.numberMask = createNumberMask({
      prefix: '',
      allowDecimal: true,
      thousandsSeparatorSymbol: this.thousandsSeparatorSymbol,
      decimalSymbol: this.decimalSymbol
    });

    this.formControl.valueChanges
      .pipe(this.takeUntilDestroyed())
      .subscribe(values => {
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

  protected onControlChange(value: any): void {
    if (this.maxLength > 0 && String(Math.floor(Number(value))).length > this.maxLength) {
      this.writeValue(this.prevValue);
    } else {
      this.prevValue = value;
      super.onControlChange(value);
    }
  }

  private mask(value: number): string {
    // This is a simulation of what text mask library does, but we cannot use it because all of the methods are internal
    // and we cannot use our implementation only because most important about text mask lib is runtime 'as-you-type' events
    const integerPart: string = this.addThousandsSeparator(Math.floor(value), this.thousandsSeparatorSymbol);
    const decimalPart: string = (value - Math.floor(value)).toFixed(2).substring(2);
    return `${integerPart}${this.decimalSymbol}${decimalPart}`;
  }

  private unmask(value: string): number {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    let newValue: string = value;

    if (this.thousandsSeparatorSymbol) {
      newValue = newValue.split(this.thousandsSeparatorSymbol).join('');
    }

    if (this.decimalSymbol) {
      newValue = newValue.replace(this.decimalSymbol, '.');
    }

    return newValue.length === 0 ? null : parseFloat(newValue);
  }

  private addThousandsSeparator(numberString: any, separator: string): string {
    return String(numberString).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }
}
