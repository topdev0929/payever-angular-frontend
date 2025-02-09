import { Directive, ElementRef } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: `
    input[matDatepicker]input[formControlName],
    input[matDatepicker]input[formControl],
  `,
})
export class PeDatePickerErrorStateMatcherDirective implements ErrorStateMatcher {
  constructor(
    host: MatInput,
    private elementRef: ElementRef
  ) {
    host.errorStateMatcher = this;
  }

  isErrorState(control: AbstractControl, form: FormGroupDirective | NgForm): boolean {
    // in this case, the form value is a native date object,
    //  so when typing the date it's falsy until it's fully typed in
    // e.g. "01/1" => falsy form value.
    const hasValue = control.value
      || this.elementRef?.nativeElement?.value;

    return control.invalid && (hasValue && control.touched || form.submitted);
  }

}

