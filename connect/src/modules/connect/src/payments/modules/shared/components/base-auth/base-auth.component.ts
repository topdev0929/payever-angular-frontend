import { Injector, Input, Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep, forEach, isEqual, isArray, isObject } from 'lodash-es';

import { FieldSettingsInterface, InputSettingsInterface } from '@pe/forms';

import { BasePaymentFormComponent } from '../base-payment-form.component';

interface FieldInpitSettingsInterface {
  fieldSettings: Observable<FieldSettingsInterface>;
  inputSettings: Observable<InputSettingsInterface>;
}

@Directive()
export abstract class BaseAuthComponent<T> extends BasePaymentFormComponent<T> {

  @Input() paymentIndex: number = 0;

  startValue: T;
  hideDisabled: boolean = false;

  constructor(injector: Injector) {
    super(injector);
  }

  get formStorageKey(): string {
    return 'payment-auth-' + this.paymentMethod; // TODO Make more unique
  }

  afterCreateFormDeferred() {
    this.startValue = cloneDeep(this.form.value);
  }

  isStartValueChanged(): boolean {
    return !isEqual(this.removeNulls(cloneDeep(this.startValue)), this.removeNulls(cloneDeep(this.form ? this.form.value : {})));
  }

  isDoReset(): boolean {
    return this.isVariantStatusConnected(this.paymentIndex) && !this.isStartValueChanged();
  }

  onSubmit(): void {
    if (this.isDoReset()) {
      this.isLoading$.next(true);
      this.paymentsStateService.resetCredentails(this.payment, this.payment.variants[this.paymentIndex]).pipe(takeUntil(this.destroyed$)).subscribe(data => {
        this.onClearCredentials();
        this.changeDetectorRef.detectChanges();
        this.isLoading$.next(false);
      }, error => {
        // TODO Maybe should set errors from bag?
        this.isLoading$.next(false);
        this.handleError(error, true);
      });
    } else {
      super.onSubmit();
    }
  }

  onSuccess() {
    this.isLoading$.next(true);
    this.paymentsStateService.saveCredentials(this.form.value, this.payment, this.payment.variants[this.paymentIndex])
      .pipe(takeUntil(this.destroyed$)).subscribe(data => {
        this.setStorageData(null);
        this.startValue = cloneDeep(this.form.value);
        this.changeDetectorRef.detectChanges();
        this.isLoading$.next(false);
      }, error => {
        this.isLoading$.next(false);
        this.handleError(error, true);
      });
  }

  protected makeFieldInputSettings$(fieldSettings: FieldSettingsInterface, inputSettings: InputSettingsInterface = {}): FieldInpitSettingsInterface {
    const fieldSettings$: BehaviorSubject<FieldSettingsInterface> = new BehaviorSubject<FieldSettingsInterface>({
      ...fieldSettings,
      readonly: true // Need to force make work autocomplete="off" in Chrome
    });
    const inputSettings$: BehaviorSubject<InputSettingsInterface> = new BehaviorSubject<InputSettingsInterface>({
      ...inputSettings,
      autocompleteAttribute: 'off', // Doesn't work in chrome but we add anyway
      onFocus: () => {
        fieldSettings$.next({
          ...fieldSettings$.getValue(),
          readonly: false
        });
      }
    });
    return {
      fieldSettings: fieldSettings$.asObservable(),
      inputSettings: inputSettings$.asObservable()
    };
  }

  protected onClearCredentials(): void {
    forEach(this.form.controls, (control: any, key: string) => {
      forEach((this.form.get(key) as FormGroup).controls, innerControl => {
        innerControl.setValue(null);
      });
    });
    this.startValue = cloneDeep(this.form.value);
    this.setStorageData(null);
    this.isSubmitted = false; // To not highlight as error
  }

  private removeNulls(obj: any): any {
    for (const k in obj) {
      if (obj[k] === null) {
        isArray(obj) ? obj.splice(Number(k), 1) : delete obj[k];
      } else if (isObject(obj[k])) {
        this.removeNulls(obj[k]);
      }
    }
    return obj;
  }
}
