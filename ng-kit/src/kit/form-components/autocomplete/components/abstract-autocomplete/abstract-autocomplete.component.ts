import { Input, Output, EventEmitter, ViewChild, Injector, Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, filter, map } from 'rxjs/operators';

import { AbstractInputComponent } from '../../../input/components';
import { AutocompleteChangeEvent, AutocompleteDisplayWithCallback, AutocompleteFilterCallback, AutocompleteOptions } from '../../interfaces';

@Directive()
export abstract class AbstractAutocompleteComponent extends AbstractInputComponent {

  @Input('aria-label') ariaLabel: string | null;
  @Input() autoActiveFirstOption: boolean = false;
  @Input('class') classList: string;
  @Input() displayByField: string;
  @Input() displayWith: AutocompleteDisplayWithCallback;
  @Input() displayOptionByField: string;
  @Input() displayOptionWith: AutocompleteDisplayWithCallback;
  @Input() filter: AutocompleteFilterCallback;
  @Input() filterByField: string;
  @Input() options: AutocompleteOptions;
  @Input() set value(value: any) {
    this.formControl.setValue(value);
  }

  @Output() valueChange: EventEmitter<AutocompleteChangeEvent> = new EventEmitter<AutocompleteChangeEvent>();

  @ViewChild('autocomplete', { static: true }) autocomplete: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger, { static: true }) trigger: MatAutocompleteTrigger;

  filteredOptions: Observable<AutocompleteOptions>;

  constructor(protected injector: Injector) {
    super(injector);
  }

  abstract onOptionSelected(event: MatAutocompleteSelectedEvent): void;

  init(formControl: FormControl): void {
    if (!this.formControl) {
      throw new Error('AutocompleteComponent: There is no formControl provided');
    } else {
      this.filteredOptions = this.getFilteredOptions(formControl);
    }
  }

  getDisplayValue(option: any): string {
    if (option) {
      if (this.displayWith) {
        return this.displayWith(option);
      } else if (this.displayByField && option[this.displayByField]) {
        return option[this.displayByField];
      } else if (typeof option === 'string') {
        return option;
      } else {
        throw new Error('Implossible to get displayed value, please provide "displayWith" callback or "displayByField" to autocomplete');
      }
    } else {
      return null;
    }
  }

  getDisplayOptionValue(option: any): string {
    if (option) {
      if (this.displayOptionWith) {
        return this.displayOptionWith(option);
      } else if (this.displayOptionByField && option[this.displayOptionByField]) {
        return option[this.displayOptionByField];
      } else {
        return this.getDisplayValue(option);
      }
    } else {
      return null;
    }
  }

  getDisplayWithCallback(): (value: any) => string | null {
    if (this.displayWith) {
      return this.displayWith;
    } else if (this.displayByField) {
      return this.displayByFieldCallback.bind(this);
    } else {
      return null;
    }
  }

  private getFilteredOptions(formControl: FormControl): Observable<AutocompleteOptions> {
    return formControl.valueChanges
      .pipe(
        startWith(''),
        filter(value => typeof value === 'string'),
        filter(() => Array.isArray(this.options)),
        map((value: string) => {
          if (this.filter) {
            return this.filter(this.options, value);
          } else if (this.filterByField) {
            return this.filterByFieldFunc(value, this.filterByField);
          } else if (typeof this.options[0] === 'string') {
            return this.filterStringFunc(value);
          } else {
            // tslint:disable-next-line no-console
            console.warn('Impossible to filter, please provide "filter" callback or "filterByField" to autocomplete');
            return [];
          }
        })
      );
  }

  private filterStringFunc(value: string): string[] {
    return this.options.filter((option: string) => {
      return option.toLowerCase().indexOf(value.toLowerCase()) === 0;
    });
  }

  private filterByFieldFunc(value: string, field: string): string[] {
    return this.options.filter((option: any) => {
      return option[field] ? option[field].toLowerCase().indexOf(value.toLowerCase()) === 0 : false;
    });
  }

  private displayByFieldCallback(value: any): string | null {
    return value && this.displayByField && value[this.displayByField] ?
      value[this.displayByField] : null;
  }
}
