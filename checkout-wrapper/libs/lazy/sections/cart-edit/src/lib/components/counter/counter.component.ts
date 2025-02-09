import {
  Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, HostBinding,
} from '@angular/core';

@Component({
  selector: 'pe-counter',
  templateUrl: 'counter.component.html',
  styleUrls: ['counter.component.scss'],
})
export class CounterComponent implements OnInit {

  @Input() set value(value: number) {
    this.apply(value, true);
  }

  get value(): number {
    return this.theValue;
  }

  @Input() set minValue(minValue: number) {
    this.theMinValue = Math.max(0, Math.floor(minValue));
    this.apply(this.value, true);
  }

  get minValue(): number {
    return this.theMinValue;
  }

  @Input() set maxValue(maxValue: number) {
    this.theMaxValue = Math.floor(maxValue);
    this.apply(this.value, true);
  }

  get maxValue(): number {
    return this.theMaxValue;
  }

  @Input() readOnly = false;
  @Input() autoFocus = false;

  @Output() counterValueChange: EventEmitter<number> = new EventEmitter<number>();

  @HostBinding('class.pe-counter') rootClass = true;
  @ViewChild('input', { static: true }) input: ElementRef;

  private theValue = 0;
  private theMinValue = 0;
  private theMaxValue = 10000;

  private get inputElement(): HTMLInputElement {
    return this.input.nativeElement;
  }

  ngOnInit(): void {
    this.theValue = this.normalize(this.theValue);
  }

  onInput(): void {
    this.apply(parseInt(this.inputElement.value, 10) || 0);
  }

  add(value: number): void {
    this.apply(this.theValue + value);
  }

  private apply(newValue: number, noEvent?: boolean): void {
    const oldValue: number = this.theValue;

    this.theValue = this.normalize(newValue);

    if (this.inputElement.value !== String(this.theValue)) {
      this.inputElement.value = String(this.theValue);
    }

    if (!noEvent && this.theValue !== oldValue) {
      this.counterValueChange.emit(this.theValue);
    }
  }

  private normalize(value: number): number {
    return Math.round(Math.max(0, this.theMinValue, Math.min(this.theMaxValue, value)));
  }

}
