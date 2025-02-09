import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Optional,
  Renderer2,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebSize, PebUnit } from '@pe/builder/core';

import { PebNumberInputComponent } from '../number-input/number-input.component';

@Component({
  selector: 'peb-size-input',
  templateUrl: './size-input.component.html',
  styleUrls: ['./size-input.component.scss'],
})
export class PebSizeInputComponent implements ControlValueAccessor, OnDestroy {

  @Input() units: PebUnit[] = [PebUnit.Percent, PebUnit.Pixel, PebUnit.Auto];
  @Input() prefix = '';
  @Input() step = 1;
  @Input() precision = 0;
  @Input() min = Number.NEGATIVE_INFINITY;
  @Input() max = Number.POSITIVE_INFINITY;
  @Input() increment?: HTMLButtonElement;
  @Input() decrement?: HTMLButtonElement;

  pebUnit = PebUnit;
  onTouched: Function;

  formGroup = new FormGroup({
    unit: new FormControl(this.units[0]),
    value: new FormControl(0),
  });

  private readonly destroy$ = new Subject<void>();

  @ViewChild(PebNumberInputComponent, { static: true }) private readonly numberInput: PebNumberInputComponent;
  @ViewChild('unitSelector', { static: true }) private readonly unitSelector: ElementRef;

  constructor(
    private readonly renderer: Renderer2,
    @Optional() @Self() private ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  changeUnit(unit: string) {
    this.formGroup.controls.unit.patchValue(unit);
  }

  registerOnChange(fn: (value: PebSize) => void): void {
    this.formGroup.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(fn),
    ).subscribe();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: PebSize): void {
    this.formGroup.patchValue(value, { emitEvent: false });
  }

  setDisabledState(isDisabled: boolean): void {
    this.numberInput.setDisabledState(isDisabled);
    this.renderer.setProperty(this.unitSelector.nativeElement, 'disabled', isDisabled);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
