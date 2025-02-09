import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class SectionContainerService {
  private paymentForms: FormGroup[] = [];

  addForm(form:FormGroup): void {
    this.paymentForms.push(form);
  }

  removeForm(form: FormGroup): void {
    this.paymentForms = this.paymentForms.filter(paymentForm =>
      Object.keys(form.controls).join('_') !== Object.keys(paymentForm.controls).join('_'));
  }

  isValidAllForms(): boolean {
    return this.paymentForms.filter(form => !form.disabled).every(form => form.valid);
  }
}
