import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';

@Component({
  selector: 'pe-counter',
  templateUrl: 'counter.component.html',
  styleUrls: ['counter.component.scss']
})
export class CounterComponent implements OnInit {

  @Input() set value(value: number) {
    this.apply(value, true);
  }
  get value(): number {
    return this._value;
  }

  @Input() set minValue(minValue: number) {
    this._minValue = Math.max(0, Math.floor(minValue));
    this.apply(this.value, true);
  }
  get minValue(): number {
    return this._minValue;
  }

  @Input() set maxValue(maxValue: number) {
    this._maxValue = Math.floor(maxValue);
    this.apply(this.value, true);
  }
  get maxValue(): number {
    return this._maxValue;
  }

  @Input() readOnly: boolean = false;
  @Input() autoFocus: boolean = false;

  @Output() counterValueChange: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('input', { static: true }) input: ElementRef;

  private _value: number = 0;
  private _minValue: number = 0;
  private _maxValue: number = 10000;

  private get inputElement(): HTMLInputElement {
    return this.input.nativeElement;
  }

  ngOnInit(): void {
    this._value = this.normalize(this._value);
  }

  onInput(): void {
    this.apply(parseInt(this.inputElement.value, 10) || 0);
  }

  add(value: number): void {
    this.apply(this._value + value);
  }

  private apply(newValue: number, noEvent?: boolean): void {
    const oldValue: number = this._value;

    this._value = this.normalize(newValue);

    if (this.inputElement.value !== String(this._value)) {
      this.inputElement.value = String(this._value);
    }

    if (!noEvent && this._value !== oldValue) {
      this.counterValueChange.emit(this._value);
    }
  }

  private normalize(value: number): number {
    return Math.round(Math.max(0, this._minValue, Math.min(this._maxValue, value)));
  }

}
