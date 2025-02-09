import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcherInterface } from '../interfaces';

export class FieldsetErrorStateMatcher implements ErrorStateMatcherInterface {

  /**
   * Custom submited state per fieldset (required for stepper)
   */
  submitted: boolean = false;

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted: boolean = (form && form.submitted) || this.submitted;
    const errorTypes: string[] = (control && control.errors) ? Object.keys(control.errors) : [];
    const isRequiredError: boolean = errorTypes.length > 0 && errorTypes.indexOf('required') > -1;

    return Boolean(
      control
      && control.invalid
      && (
        isSubmitted ||
        (isSubmitted && control.touched)
        || (!isSubmitted && control.touched && !isRequiredError)
      )
    );
  }
}
