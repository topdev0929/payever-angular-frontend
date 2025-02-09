import { ValidatorFn, AbstractControl } from '@angular/forms';
import { AutocompleteOptions } from '../interfaces';
import { BehaviorSubject } from 'rxjs';

export const isSuggestedValueValidator = (options: BehaviorSubject<AutocompleteOptions>): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (options.value && control.value) {
      const pickedOrNot = control.value.value ? options.value.filter(option => option.value === control.value.value) : [];

      if (pickedOrNot.length === 0) {
        // there's no matching selectboxvalue selected. so return match error.
        return { match: true };
      }
    }
    // everything's fine. return no error. therefore it's null.
    return null;
  };
};
