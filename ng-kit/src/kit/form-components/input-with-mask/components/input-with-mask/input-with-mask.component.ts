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
import { UnmaskCallback } from '../../interfaces';

@Component({
  selector: 'pe-input-with-mask',
  templateUrl: 'input-with-mask.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputWithMaskComponent),
      multi: true
    }
  ]
})
export class InputWithMaskComponent extends AbstractValueAccessorFieldComponent {

  @HostBinding('class.pe-input') hostClass: boolean = true;
  @Input() placeholder: string;

  @Input('forceDisabled') set setForceDisabled(disabled: boolean) {
    if (disabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }
  @Input() mask: (RegExp | string)[] = null;
  @Input() unmask: UnmaskCallback = null;
  private prevValue: any;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.formControl.valueChanges
      .pipe(this.takeUntilDestroyed())
      .subscribe(() => {
        this.onControlChange(this.callUnmask(this.formControl.value));
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

  private callUnmask(value: string): string {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return this.unmask ? this.unmask(value) : value;
  }

}
