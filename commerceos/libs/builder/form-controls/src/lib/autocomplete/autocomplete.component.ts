import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { SelectOption } from '@pe/builder/core';
import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PebAutocompleteComponent),
      multi: true,
    },
    PeDestroyService,
  ],
})
export class PebAutocompleteComponent implements OnInit, ControlValueAccessor {

  @Input() placeholder = '';
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() textAlign: 'left'|'center'|'right' = 'right';
  @Input() set selectedOptions(options: SelectOption[]) {
    this.optionsDictSubject$.next(Object.assign(
      this.optionsDictSubject$.value,
      options?.reduce((acc, option) => {
        acc[option.value] = option;

        return acc;
      }, {}),
    ));
  }

  private readonly optionsSubject$ = new BehaviorSubject<SelectOption[]>([]);
  @Input() set options(value: SelectOption[]) {
    const options = value || [];
    this.optionsSubject$.next(options);
    this.optionsDictSubject$.next(Object.assign(
      this.optionsDictSubject$.value,
      options.reduce((acc, option) => {
        acc[option.value] = option;

        return acc;
      }, {}),
    ));
  }

  @Output() inputValueChange = new EventEmitter<string>();

  private readonly optionsDictSubject$ = new BehaviorSubject<{ [value: string]: SelectOption }>({});

  onChange: (value) => void;
  onTouch: () => void;
  disabled: boolean;
  private readonly valueSubject$ = new BehaviorSubject([]);
  get value() {
    return this.valueSubject$.getValue();
  }

  set value(v) {
    this.valueSubject$.next(v);
  }

  readonly control = new FormControl('');

  readonly filteredOptions$ = combineLatest([
    this.optionsSubject$.asObservable(),
    this.control.valueChanges.pipe(
      startWith(this.control.value),
    ),
  ]).pipe(
    map(([options, input]: [SelectOption[], string]) => {
      return options.filter(option =>
        this.normalizeValue(option.name).includes(this.normalizeValue(input)) &&
        !this.value.includes(option.value));
    }),
  );

  readonly selectedOptions$: Observable<SelectOption[]> = combineLatest([
    this.optionsDictSubject$.asObservable(),
    this.valueSubject$.asObservable(),
  ]).pipe(
    map(([dict, value]) => value.reduce((acc, v) => {
      if (dict[v]) {
        acc.push(dict[v]);
      }

      return acc;
    }, [])),
  );

  constructor(
    private destroy$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    this.control.valueChanges.pipe(
      tap(value => this.inputValueChange.emit(value)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.value = obj || [];
  }

  getOption(value: any): Observable<SelectOption> {
    return this.optionsDictSubject$.pipe(
      map(dict => dict[value]),
    );
  }

  pushOption(option: MatAutocompleteSelectedEvent) {
    this.value = [...this.value, option.option.value];
    this.onChange(this.value);
    this.onTouch();
    this.control.setValue('');
  }

  removeOption(option: SelectOption): void {
    this.value = this.value.filter(v => v !== option.value);
    this.onChange(this.value);
    this.onTouch();
  }

  onEnter() {

  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
}
