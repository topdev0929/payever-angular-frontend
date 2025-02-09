import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ColorPickerFormat, ColorPickerAlign } from '../../../../../../kit/form-components/color-picker';

@Component({
  selector: 'doc-color-picker-default-example',
  templateUrl: 'color-picker-default-example.component.html',
  styles: [
    `.color-picker-form { height: 800px; }`
  ]
})
export class ColorPickerDefaultExampleDocComponent implements OnInit {

  form: FormGroup;

  align: ColorPickerAlign = null;
  format: ColorPickerFormat;

  firstAlpha: boolean = false;
  secondAlpha: boolean = true;

  firstComplex: boolean = false;
  secondComplex: boolean = false;

  readonly ColorPickerFormat = ColorPickerFormat;
  readonly ColorPickerAlign = ColorPickerAlign;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      colorPickerFirst: '#0084ff',
      colorPickerSecond: 'rgba(65,192,64,.5)'
    });
  }

  changeAlign(): void {
    this.align = ColorPickerAlign.Left;
  }

  onSubmit() {
    
  }
}
