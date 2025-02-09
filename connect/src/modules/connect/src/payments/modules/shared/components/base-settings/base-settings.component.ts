import { EventEmitter, Injector, Input, Output, Directive } from '@angular/core';
import { cloneDeep, isEqual } from 'lodash-es';

import { PaymentMethodEnum } from '../../../../../shared';
import { BasePaymentFormComponent } from '../base-payment-form.component';
import { SettingsOptionsInterface } from '../base-main.component';

@Directive()
export abstract class BaseSettingsComponent<T> extends BasePaymentFormComponent<T> {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex: number = 0;
  @Output() changed: EventEmitter<SettingsOptionsInterface> = new EventEmitter();

  startValue: T;
  hideDisabled: boolean = false;

  fieldsetsKey: string = 'credentials';
  isSaveAsFormOptions: boolean = false;

  constructor(injector: Injector) {
    super(injector);
  }

  get formStorageKey(): string {
    return 'payment-settings-' + this.paymentMethod; // Doesn't matter here
  }

  afterCreateFormDeferred() {
    this.startValue = cloneDeep(this.form.value);
  }

  protected onUpdateFormData(formValues: any): void {
    if (this.startValue && formValues && !isEqual(this.startValue, formValues)) {
      this.startValue = cloneDeep(this.form.value);
      this.changed.emit(
        this.isSaveAsFormOptions ?
          { options:  this.form.value } :
          { settings: this.form.value }
      );
    }
  }

  onSuccess(): void {
    return;
  }
}
