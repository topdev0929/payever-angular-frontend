import {
  Component, OnInit, ChangeDetectionStrategy, Input, ViewEncapsulation, Output,
  EventEmitter, SimpleChanges, OnChanges, ChangeDetectorRef,
} from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'pe-message-slider',
  templateUrl: './message-slider.component.html',
  styleUrls: ['./message-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageSliderComponent implements OnInit, OnChanges {

  @Input() label?: string;
  @Input() value = '0px';
  @Input() unit = 'px';
  @Input() min = 0;
  @Input() max = 50;
  @Input() step = 1;
  @Input() color = '#3d3d3d';

  @Output() changing = new EventEmitter<string>();
  @Output() changed = new EventEmitter<string>();

  unitValue = 0;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initUnitAndValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.initUnitAndValue();
    }
  }

  initUnitAndValue(): void {
    if (this.value) {
      const unit = this.value.match(/[^\d]{1,2}|%/);
      const unitValue = this.value.match(/\d{1,3}/);
      if (unit && unitValue) {
        this.unit = unit[0] || this.unit;
        this.unitValue = Number(unitValue[0] || '0');

        this.changeDetectorRef.detectChanges();
      }
    }
  }

  changingValue(event: MatSliderChange): void {
    this.unitValue = event.value || 0;
    this.value = `${this.unitValue}${this.unit}`;
    this.changing.emit(this.value);
  }

  changedValue(event: MatSliderChange): void {
    this.unitValue = event.value || 0;
    this.value = `${this.unitValue}${this.unit}`;
    this.changed.emit(this.value);
  }
}
