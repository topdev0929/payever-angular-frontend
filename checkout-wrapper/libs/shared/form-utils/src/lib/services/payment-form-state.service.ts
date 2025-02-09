import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for choose-payment step ui-state managing
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentFormStateService<FormInterface = any> {

  private formStateSubject: BehaviorSubject<any> = new BehaviorSubject({});
  formState$ = this.formStateSubject.asObservable();

  private patchFormSubject: BehaviorSubject<Partial<FormInterface>> = new BehaviorSubject(null);
  patchForm$ = this.patchFormSubject.asObservable();

  patchFormState<T = any>(data: T): void {
    this.formStateSubject.next({
      ...this.formStateSubject.value,
      ...data,
    });
  }

  patchFrom(formName: string, formData?: Partial<FormInterface>): void {
    let patchData;
    if (formData) {
      patchData = { [formName]: formData };
    } else {
      patchData = { [formName]: this.formState() || {} };
    }

    this.patchFormSubject.next({
      ...this.patchFormSubject.value,
      ...patchData,
    });
  }

  formState<T = any>(): T {
    return this.formStateSubject.value;
  }

  clearFormState(): void {
    this.formStateSubject.next({});
  }
}
