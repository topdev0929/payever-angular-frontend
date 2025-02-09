import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';

import { DevModeService } from '../dev';
import { CurrencyPipe } from '../i18n';

export interface PriceValueChangeEventInterface {
  value: string;
  decimalValue: number;
  formattedValue: string;
}

export type PriceInputValueSetterType = string | number | {
  value: string | number;
  cursorPosition?: number;
};

@Component({
  selector: 'pe-price',
  templateUrl: 'price.component.html'
})
export class PriceComponent implements AfterViewInit {

  @Input() currency: string;
  @Input() initialValue: string | number = '0.00';
  @Input() autoFocus: boolean = false;
  @Input() min: number = 0.0;
  @Input() max: number = 1000000.0;
  @Input() disabled: boolean = false;
  @Input('setValue') valueSetter: Subject<PriceInputValueSetterType>;

  @Output('priceValueChange') priceValueChange: EventEmitter<PriceValueChangeEventInterface> = new EventEmitter();

  @ViewChild('input', { static: true }) input: ElementRef;

  width: number;

  private initialWidth: number;
  private valueNoFormat: string = String(this.initialValue);

  private readonly clipboardRE: RegExp = /^\d+(?:[.,]\d+)*$/;
  private readonly numbersRE: RegExp = /[(0-9)+?(0-9)*]+/;
  private readonly decimalPipeFormat: string = '1.2-2';
  private readonly noDigitsRE: RegExp = /\D/g;
  private readonly noDigitsAndDotsRE: RegExp = /[^0-9\.\,]/g;
  private readonly replaceExceptLastDot: RegExp = /(\.|\,)(?=.*(\.|\,))/g;
  private readonly digitGroups: RegExp = /^(\d+)(\d\d)$/;
  private readonly digitGroupsTemplate: string = '$1.$2';
  private readonly deleteDigitMask: RegExp = /\d[\.\,\s]?$/;

  constructor(
    private ngZone: NgZone,
    private currencyPipe: CurrencyPipe,
    private cdr: ChangeDetectorRef,
    private devMode: DevModeService,
  ) {
  }

  ngAfterViewInit(): void {
    this.initialWidth = this.input.nativeElement.offsetWidth;

    this.setValue(this.parseOuterValue(this.initialValue));

    if (this.valueSetter) {
      this.valueSetter.subscribe(value => {
        if (typeof value === 'string' || typeof value === 'number') {
          this.setValue(this.parseOuterValue(value));
        } else {
          this.setValue(this.parseOuterValue(value.value), value.cursorPosition);
        }
      });
    }
  }

  onKeypress(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      event.preventDefault();

      const inputChar: string = String.fromCharCode(event.charCode);

      if (this.numbersRE.test(inputChar) && !this.disabled) {
        this.insertBySelection(inputChar);
      }
    });
  }

  onDelete(event: KeyboardEvent): void {
    this.ngZone.runOutsideAngular(() => {
      event.preventDefault();

      if (!this.disabled) {
        this.deleteBySelection();
      }
    });
  }

  onPaste(event: ClipboardEvent): void {
    this.ngZone.runOutsideAngular(() => {
      event.preventDefault();

      const content: string = event.clipboardData.getData('text/plain');

      if (this.clipboardRE.test(content) && !this.disabled) {
        this.insertBySelection(content);
      }
    });
  }

  /**
   * Logic below
   */

  private insertBySelection(inputChars: string): void {
    const selectionStart: number = this.input.nativeElement.selectionStart;
    const selectionEnd: number = this.input.nativeElement.selectionEnd;

    const input: string = this.input.nativeElement.value;
    const changed: string = `${
      input.slice(0, selectionStart)
    }${
      inputChars
    }${
      input.slice(selectionEnd)
    }`;

    this.setValue(changed, selectionStart + 1);
  }

  private deleteBySelection(): void {
    const selectionStart: number = this.input.nativeElement.selectionStart;
    const selectionEnd: number = this.input.nativeElement.selectionEnd;

    const input: string = this.input.nativeElement.value;
    const changed: string = `${
      input.slice(0, selectionStart).replace(this.deleteDigitMask, '')
    }${
      input.slice(selectionEnd)
    }`;

    this.setValue(changed, selectionStart + (changed.length - input.length));
  }

  private setValue(value: string, rangePosition?: number): void {
    const valueNoFormat: string = this.valueNoFormat;
    const padded: string = this.padStart(value);

    const decimalValue: number = this.minmax(
      this.decimalValue(padded),
      parseFloat(this.parseOuterValue(valueNoFormat))
    );

    const formattedValue: string = this.format(decimalValue.toString(10));

    this.valueNoFormat = decimalValue.toString(10);
    this.input.nativeElement.value = formattedValue;

    if (!isNaN(rangePosition)) {
      const position: number = rangePosition + (formattedValue.length - value.length);
      this.input.nativeElement.setSelectionRange(position, position);
    }

    this.width = this.getWidth();

    if (this.devMode.isDevMode()) {
      this.cdr.detectChanges();
    }

    this.priceValueChange.emit({
      decimalValue,
      formattedValue,
      value: formattedValue
    });
  }

  /**
   * Below are helpers
   */

  private padStart(value: string): string {
    return value.padStart(2, '0').padStart(3, '.').padStart(4, '0');
  }

  private decimalValue(value: string): number {
    return parseFloat(
      value
        .replace(this.noDigitsRE, '')
        .replace(this.digitGroups, this.digitGroupsTemplate)
    );
  }

  // NOTE: Outer value should be normalized to '1.2-2' decimal format too,
  // to avoid capability bugs
  private parseOuterValue(value: string | number): string {
    return parseFloat(
      String(value)
        .replace(this.noDigitsAndDotsRE, '')
        .replace(this.replaceExceptLastDot, '')
        .replace(',', '.')
    ).toFixed(2);
  }

  private format(value: string): string {
    return this.currencyPipe.transform(value, this.currency, '', this.decimalPipeFormat);
  }

  private getWidth(): number {
    return this.input.nativeElement.value.length ?
      this.input.nativeElement.value.length * this.initialWidth :
      this.initialWidth;
  }

  private minmax(value: number, prevValue: number): number {
    if (value > this.max) {
      return prevValue;
    } else if (value < this.min) {
      return this.min;
    } else {
      return value;
    }
  }

}
