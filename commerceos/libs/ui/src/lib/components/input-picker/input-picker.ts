import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { PePickerDataInterface } from '../picker';

import { getUniqueId } from './misc/unique-id-counter.helper';

@Component({
  selector: 'pe-input-picker',
  templateUrl: './input-picker.html',
  styleUrls: ['./input-picker.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('isFocusedLabel', [
      state(
        'true',
        style({
          transform: 'scale(1)',
          height: "100%",
        }),
      ),
      state(
        'false',
        style({
          transform: 'translate(3px, 4px) scale(.75)',
          height: "50%",
        }),
      ),
      transition('true => false', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
      transition('false => true', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
    trigger('isFocusedText', [
      state(
        'true',
        style({
          height: 0,
        }),
      ),
      state(
        'false',
        style({}),
      ),
      transition('true => false', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
      transition('false => true', animate('150ms cubic-bezier(0.4,0,0.2,1)')),
    ]),
  ],
})
export class PeInputPickerComponent implements OnInit, OnChanges, AfterViewInit {
  isFocused = false;

  @Input() placeholder: string;
  @Input() label: string;
  @Input() data: PePickerDataInterface[] = [];
  @Input() buttonFunction: () => void;
  @Input() buttonLabel: string;
  @Input() panelClass: string;
  @Input() autoSelectSameOption: boolean;
  @Input() errorMessage: string;
  @Input() isFieldInvalid = false;
  @Input() animated = true;

  @Input() set selectedItem(item: PePickerDataInterface) {
    if (!item) {
      return;
    }

    this.pickedItem = item;
    this.filteredOptions = this.customFilter('');
    queueMicrotask(() => {
      this.inputRef.nativeElement.value = item.label;
      this.inputRef.nativeElement.blur();
    });
  }

  inputId = `pe-picker-${getUniqueId()}`;

  filteredOptions: PePickerDataInterface[] = [];

  pickedItem: PePickerDataInterface;

  focusLine = false;

  @Output() readonly changed: EventEmitter<PePickerDataInterface> = new EventEmitter<PePickerDataInterface>();
  @Output() readonly touched: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly inputBlur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  @ViewChild('input') inputRef: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef<HTMLElement>,
    private focusMonitor: FocusMonitor,
    private readonly destroy$: PeDestroyService,
    ) {}

  ngAfterViewInit(): void {
       this.focusMonitor.monitor(this.elRef.nativeElement, true)
      .pipe(
        tap((focus) => {
          if (focus === null) {
            if (this.inputRef.nativeElement.value === '') {
              this.isFocused = false;
              this.focusLine = false;
            }
            this.inputRef.nativeElement.blur();
          } else if (focus !== 'program'){
            this.isFocused = true;
            this.focusLine = true;
            setTimeout(() => {
              this.inputRef.nativeElement.focus();
            }, 150);
          }
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredOptions = this.customFilter('');
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.filteredOptions = this.customFilter('');
    this.cdr.detectChanges();
  }

  getOptionText(option) {
    return option?.label ? option.label : '';
  }

  emitChanges() {
    this.changed.emit(this.pickedItem.value);
  }

  onKey(event) {
    this.filteredOptions = this.customFilter(event.target.value);
    if (!event.target.value && this.pickedItem) {
      this.pickedItem = {
        label: null,
        value:null,
      };
      this.emitChanges();
    }
    this.cdr.detectChanges();
  }

  onBlur(event) {
    const inputValue = event.target.value;
    this.focusLine = false;
    if (this.autoSelectSameOption && inputValue) {
      const lowerCaseValue = inputValue.toLowerCase();
      const sameOption = this.filteredOptions.find(option => option.label.toLowerCase() === lowerCaseValue);
      if (sameOption) {
        this.onAddItem(sameOption);
      } else {
        this.pickedItem = {
          label: null,
          value: null,
        };
        this.emitChanges();
      }
    }

    this.inputBlur.emit(event);
  }

  onAddItem(option: PePickerDataInterface) {
    this.pickedItem = option;
    this.inputRef.nativeElement.value = option.label;
    this.filteredOptions = this.customFilter('');
    this.inputRef.nativeElement.blur();
    this.isFocused = true;
    this.focusLine = false;
    this.isFieldInvalid = false;

    this.cdr.detectChanges();
    this.touched.emit();
    this.emitChanges();
  }

  onButtonClick() {
    this.buttonFunction();
    this.emitChanges();
  }

  private customFilter(value: string) {
    const filterValue = value.toLowerCase();

    return this.data.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  shouldAnimate() {
    if (this.animated && this.isFieldInvalid) {
      return false;
    }

    return this.animated && !this.isFocused && !this.pickedItem?.value;
  }
}
