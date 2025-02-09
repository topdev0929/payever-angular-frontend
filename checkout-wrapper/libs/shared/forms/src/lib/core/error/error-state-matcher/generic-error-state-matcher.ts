import { Injectable } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Injectable()
export class CheckoutErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl, form: FormGroupDirective | NgForm): boolean {
    return control.invalid && (control.value && control.touched || form.submitted);
  }
}
