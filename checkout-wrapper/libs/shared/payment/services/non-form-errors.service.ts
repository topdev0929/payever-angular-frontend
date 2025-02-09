import { Injectable } from '@angular/core';
export interface ErrorsInterface {
  [key: string]: string;
}

/**
 * We need this service to pass errors from PaymentForm to FinishedModal.
 * Solution is not perfect, but only form component can detect which keys do not belong to form fields.
 */
@Injectable({
  providedIn: 'root',
})
export class NonFormErrorsService {

  private errors: ErrorsInterface = null;

  setErrors(errors: ErrorsInterface): void {
    this.errors = errors;
  }

  getErrors(): ErrorsInterface {
    return this.errors || {};
  }

  getErrorsAsLines(): string[] {
    return Object.values(this.getErrors());
  }
}
