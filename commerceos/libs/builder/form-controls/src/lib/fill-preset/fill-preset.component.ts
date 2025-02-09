import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { pebColorToHEX } from '@pe/builder/color-utils';
import { RGBA } from '@pe/builder/core';

@Component({
  selector: 'peb-fill-preset',
  templateUrl: './fill-preset.component.html',
  styleUrls: ['./fill-preset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebFillPresetComponent {

  @Input() control: FormControl;
  @Output() colorSelected = new EventEmitter<string>();

  columns: { hex: string, rgba: RGBA }[][] = [
    [
      { r: 255, g: 255, b: 255, a: 1 },
      { r: 217, g: 217, b: 217, a: 1 },
      { r: 70, g: 70, b: 70, a: 1 },
      { r: 0, g: 0, b: 0, a: 1 },
    ],
    [
      { r: 0, g: 145, b: 223, a: 1 },
      { r: 0, g: 123, b: 189, a: 1 },
      { r: 0, g: 92, b: 141, a: 1 },
      { r: 0, g: 63, b: 96, a: 1 },
    ],
    [
      { r: 235, g: 70, b: 83, a: 1 },
      { r: 204, g: 60, b: 71, a: 1 },
      { r: 168, g: 50, b: 59, a: 1 },
      { r: 127, g: 35, b: 42, a: 1 },
    ],
    [
      { r: 89, g: 55, b: 255, a: 1 },
      { r: 77, g: 46, b: 230, a: 1 },
      { r: 64, g: 38, b: 195, a: 1 },
      { r: 48, g: 28, b: 148, a: 1 },
    ],
    [
      { r: 255, g: 190, b: 0, a: 1 },
      { r: 220, g: 164, b: 0, a: 1 },
      { r: 183, g: 136, b: 0, a: 1 },
      { r: 143, g: 106, b: 0, a: 1 },
    ],
    [
      { r: 6, g: 157, b: 59, a: 1 },
      { r: 4, g: 125, b: 47, a: 1 },
      { r: 4, g: 101, b: 38, a: 1 },
      { r: 3, g: 77, b: 29, a: 1 },
    ],
  ].map(row => row.map(rgba => ({ hex: pebColorToHEX(rgba), rgba })));

  select(color) {
    this.control?.markAsTouched();
    this.control?.markAsDirty();
    this.control?.patchValue(color.rgba);
    this.colorSelected.emit(color.rgba);
  }
}
