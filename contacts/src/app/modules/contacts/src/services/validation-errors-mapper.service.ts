import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { TranslateService } from '@pe/i18n';

const MOBILE_PHONE_PATTERN: RegExp = /^\+[1-9]{1}[0-9]{3,14}$/;

@Injectable()
export class ValidationErrorsMapperService {
  private readonly errorsLocalesMap = {
    required: 'Field is required',
    email: 'Invalid Email',
    [`${MOBILE_PHONE_PATTERN.toString()}`]: 'Pattern error',
  };

  constructor(private translationService: TranslateService) { }

  getErrorMessage(errorName: string): string {
    return this.translationService.translate(this.errorsLocalesMap[errorName]);
  }

  getAllErrorMessages(errors: ValidationErrors): string[] {
    const allErrorNames = Object.keys(errors || {});

    return allErrorNames.map(errorName => this.getErrorMessage(errorName));
  }
}
