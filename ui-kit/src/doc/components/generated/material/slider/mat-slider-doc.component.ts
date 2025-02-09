import { Component } from '@angular/core';

@Component({
  selector: 'mat-slider-doc',
  templateUrl: './mat-slider-doc.component.html'
})
export class MatSliderDocComponent {
  sliderDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/slider-example-default.component.html');
  sliderDefaultExampleComponent: string = require('!!raw-loader!./examples/default/slider-example-default.component.ts');
}
