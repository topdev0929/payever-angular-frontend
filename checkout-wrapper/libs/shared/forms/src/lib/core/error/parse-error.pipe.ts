import { Pipe, PipeTransform } from '@angular/core';
import memoize from 'fast-memoize';

interface FormFieldError {
  key: string;
  value: string | boolean | object;
}

const ERRORS: { [key: string]: (label: string, errorValue?: any) => string } = {
  required: (label: string) => $localize `:@@ng_kit.forms.error.validator.required:${label}:fieldName:`,
  pattern: (label: string) => $localize `:@@ng_kit.forms.error.validator.pattern:${label}:fieldName:`,
  expired: (label: string) => $localize `:@@ng_kit.forms.error.validator.expired:${label}:fieldName:`,
  email: (label: string) => $localize `:@@ng_kit.forms.error.validator.email:${label}:fieldName:`,
  minlength: (label: string) => $localize `:@@ng_kit.forms.error.validator.minlength:${label}:fieldName:`,
  maxlength: (label: string) => $localize `:@@ng_kit.forms.error.validator.maxlength:${label}:fieldName:`,
  match: (label: string) => $localize `:@@ng_kit.forms.error.validator.match:`,
  invalidName: (label: string) => $localize `:@@ng_kit.forms.error.validator.name.invalid_character:`,
};

@Pipe({
  name: 'parseError',
  standalone: true,
})
export class ParseErrorPipe implements PipeTransform {

  private errorMemo = memoize(this.getError.bind(this));

  public transform(error: FormFieldError, fieldName: string) {
    return this.errorMemo(error, fieldName);
  }

  private defaultError(fieldName: string): string {
    return $localize `:@@ng_kit.forms.error.unknown_error:${fieldName}:fieldName:`;
  }

  private getError(error: FormFieldError, fieldName: string): string {
    return typeof error.value == 'string'
      ? error.value
      : ERRORS[error.key]?.(fieldName) ?? this.defaultError(fieldName);
  }
}
