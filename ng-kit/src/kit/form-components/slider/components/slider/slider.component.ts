import { Component, EventEmitter, Input, Injector, Output, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';

import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { SliderChangeEvent } from '../../interfaces';

const DEFAULT_MAX: number = 100;
const DEFAULT_MIN: number = 0;
const DEFAULT_STEP: number = 1;

@Component({
  selector: 'pe-slider',
  templateUrl: 'slider.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SliderComponent extends AbstractFieldComponent implements OnInit {

  @Input() displayWith: (value: number) => string;
  @Input() label: string;
  @Input() max: number = DEFAULT_MAX;
  @Input() min: number = DEFAULT_MIN;
  @Input() multiplyFactor: number;
  @Input() preventUpdatingValueByInput: boolean = false;
  @Input() roundToFixed: number;
  @Input() showValueLabel: boolean = true;
  @Input() step: number = DEFAULT_STEP;
  @Input() thumbLabel: boolean = false;
  @Input() valueLabelAppend: string;

  @Output() valueChange: EventEmitter<SliderChangeEvent> = new EventEmitter<SliderChangeEvent>();
  @Output() input: EventEmitter<SliderChangeEvent> = new EventEmitter<SliderChangeEvent>();

  get valueLabel(): string {
    return `${this.formatValueLabelFunction(this.formControl.value)}${this.valueLabelAppend ? this.valueLabelAppend : ''}`;
  }

  get formatValueLabelFunction(): (value: number) => string {
    return this.displayWith ? this.displayWith : this.formatValueLabel;
  }

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.normilizeValues();
  }

  onInput(event: MatSliderChange): void {
    this.input.emit({ value: event.value });
    if (!this.preventUpdatingValueByInput) {
      this.formControl.setValue(event.value, { emitEvent: false });
      this.onValueChange(event);
    }
  }

  onValueChange(event: MatSliderChange): void {
    this.valueChange.emit({ value: event.value });
  }

  private formatValueLabel(value: number): string {
    let res: number = value || this.min;
    if (value && this.multiplyFactor !== undefined) {
      res = value * this.multiplyFactor;
    }
    if (this.roundToFixed !== undefined) {
      return res.toFixed(this.roundToFixed);
    } else {
      return res.toString();
    }
  }

  private normilizeValues(): void {
    this.max = this.max || DEFAULT_MAX;
    this.min = this.min ||  DEFAULT_MIN;
    this.step = this.step || DEFAULT_STEP;
    if (typeof(this.showValueLabel) !== 'boolean') {
      this.showValueLabel = true;
    }
  }
}
