import { Component } from '@angular/core';
import { peVariables } from '../../../../../../../../scss/pe-variables';
import { SpinnerSizes } from './spinner-example-default.type';

@Component({
  selector: 'doc-spinner-example-default',
  templateUrl: './spinner-example-default.component.html'
})
export class SpinnerExampleDefaultComponent {

  strokeWidth: number;
  sizes: SpinnerSizes;

  constructor() {
    this.strokeWidth = parseFloat(peVariables['spinnerStrokeWidth'] as string);

    this.sizes = {
      lg: parseFloat(peVariables['spinnerStrokeLg'] as string),
      md: parseFloat(peVariables['spinnerStrokeMd'] as string),
      sm: parseFloat(peVariables['spinnerStrokeSm'] as string),
      xs: parseFloat(peVariables['spinnerStrokeXs'] as string),
      xxs: parseFloat(peVariables['spinnerStrokeXxs'] as string)
    }
  }
}
