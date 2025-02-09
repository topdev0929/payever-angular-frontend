import { Component, ElementRef, HostBinding, Injector, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

import {
  AutoCompleteChipsAddOptionInterface,
  AutocompleteChipsType,
  AutocompleteOption,
  AutocompleteOptions,
  AutocompleteValidateCallback
} from '../../interfaces';
import { AbstractAutocompleteComponent } from '../abstract-autocomplete';
import { AutocompleteChipsEventType, AutocompleteChipsSize } from '../../enums';

@Component({
  selector: 'pe-autocomplete-chips',
  templateUrl: 'chips-autocomplete.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AutocompleteChipsComponent extends AbstractAutocompleteComponent implements OnInit {
  AutocompleteChipsSize = AutocompleteChipsSize;
  type: AutocompleteChipsType = AutocompleteChipsType.DEFAULT;
  chipsSize: AutocompleteChipsSize = AutocompleteChipsSize.Small;

  @HostBinding('class.pe-autocomplete-chips') autocompleteClass: boolean = true;
  @Input() validateInput: AutocompleteValidateCallback;
  @Input() set separatorKeys(keys: number[]) {
    this.separatorKeyCodes = keys || [COMMA, ENTER, SPACE];
  }
  @Input() addOptionButton?: AutoCompleteChipsAddOptionInterface;
  @Input('type') set setType(value: AutocompleteChipsType | undefined) {
    this.type = value || AutocompleteChipsType.DEFAULT;
  }
  @Input('chipsSize') set setChipsSize(value: AutocompleteChipsSize | undefined) {
    this.chipsSize = value || AutocompleteChipsSize.Small;
  }
  @Input() colorCheckboxClasses: string = '';
  @ViewChild('chipsInput', { static: true }) chipsInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger, { static: true }) trigger: MatAutocompleteTrigger;

  chipsInputFormControl: FormControl = new FormControl();
  separatorKeyCodes: number[] = [COMMA, ENTER, SPACE];
  autocompleteChipsType = AutocompleteChipsType;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.init(this.chipsInputFormControl);

    const formControlValue: AutocompleteOptions = Array.isArray(this.formControl.value) && this.formControl.value || [];
    this.options = this.filterOptions(this.options, formControlValue);
  }

  // Autocomplete functionality

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.clearInput();
    this.removeOption(event.option.value);
    if (this.type === AutocompleteChipsType.COLOR) {
      const option = this.options.find(({value}) => value === event.option.value);
      if (!option) {
        console.warn('no such option in options list');
        return;
      }
      let value = this.formControl.value;
      const isSelected = value.some((val: string) => val === option.value);
      value = isSelected ? value.filter((val: string) => val !== option.value) : [...value, option.value];
      this.formControl.setValue(value);
      this.valueChange.emit({ value, eventType: AutocompleteChipsEventType.Select });
    } else {
      this.formControl.setValue([...this.formControl.value, event.option.value]);
      this.valueChange.emit({ value: [...this.formControl.value], eventType: AutocompleteChipsEventType.Select });
    }
  }

  onAdd(event: MatChipInputEvent): void {
    // Add option only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    // On color selection you can't write any value
    if (!this.autocomplete.isOpen) {
      const value: string = (event.value || '').trim();

      if (!this.validateInput || this.validateInput(value)) {
        if (value && this.type !== AutocompleteChipsType.COLOR) {
          this.removeOption(event.value);
          this.formControl.setValue([...this.formControl.value, value.trim()]);
          this.valueChange.emit({ value: this.formControl.value, eventType: AutocompleteChipsEventType.Add });
        }
        this.clearInput();
      } else if (document.activeElement !== this.chipsInput.nativeElement) {
        this.clearInput();
      }
      this.trigger.closePanel();
    }
  }

  onRemove(option: AutocompleteOption): void {
    if (this.type !== AutocompleteChipsType.COLOR) {
      this.options.push(option);
    }
    if ((this.formControl.value as AutocompleteOption[]).indexOf(option) !== -1) {
      const newValue: AutocompleteOption[] = this.formControl.value
        .filter((item: AutocompleteOption) => item !== option);
      this.formControl.setValue(newValue);
      this.valueChange.emit({ value: newValue, eventType: AutocompleteChipsEventType.Remove });
    }
  }

  onClickInput(): void {
    // To trigger valueChange in getFilteredOptions() if input value is empty
    if (!this.chipsInputFormControl.value) {
      this.chipsInputFormControl.patchValue('');
    }
    this.trigger.openPanel();
  }

  isOptionSelected(value: string): boolean {
    const values = this.formControl.value;
    return values.some((val: string) => val === value);
  }

  getOptionColor(optionValue: string): string {
    const option = this.options.find(({value}: {value: string}) => value === optionValue);
    return !!option && option.hexColor || '';
  }

  private clearInput(): void {
    this.chipsInput.nativeElement.value = '';
    this.chipsInputFormControl.setValue('');
  }

  private removeOption(option: string): void {
    const indexForRemove: number = this.options.indexOf(option);
    if (indexForRemove > -1) {
      this.options.splice(indexForRemove, 1);
    }
  }

  private filterOptions(options: AutocompleteOptions, values: AutocompleteOptions): string[] {
    if (this.filterByField) {
      return options.filter((option: any) => {
        return !values.some((value: AutocompleteOption) => {
          const optionFieldValue = option[this.filterByField];
          return optionFieldValue ?
            optionFieldValue.toLowerCase() === value.toLowerCase() :
            false;
        });
      });
    } else if (typeof this.options[0] === 'string') {
      return options.filter((option: string) => {
        return !values.some((value: AutocompleteOption) => {
          return value.toLowerCase() === option.toLowerCase();
        });
      });
    } else {
      // tslint:disable-next-line no-console
      console.warn('Impossible to filter, please provide "filter" callback or "filterByField" to autocomplete');
      return options;
    }
  }
}
