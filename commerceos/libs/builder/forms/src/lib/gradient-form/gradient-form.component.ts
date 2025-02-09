import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { getGradientStyle, pebColorToCss } from '@pe/builder/color-utils';


@Component({
  selector: 'peb-gradient-form',
  templateUrl: './gradient-form.component.html',
  styleUrls: ['./gradient-form.component.scss'],
})
export class PebGradientFormComponent {
  @Input() formGroup: FormGroup;
  activeGradientIndex = 0;


  get colorStopsForm(): FormArray {
    return this.formGroup.controls.colorStops as FormArray;
  }

  get colorStops() {
    return this.colorStopsForm.value.map(val => ({ ...val, color: pebColorToCss(val.color) }));
  }

  get gradientCss() {
    const value = this.formGroup.value;

    return getGradientStyle(value);
  }

}
