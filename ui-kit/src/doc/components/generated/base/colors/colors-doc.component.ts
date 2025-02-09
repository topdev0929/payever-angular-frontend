import { Component } from '@angular/core';

@Component({
  selector: 'doc-colors',
  templateUrl: './colors-doc.component.html'
})
export class ColorsDocComponent {
  colorsBlackExampleTemplate: string = require('!!raw-loader!./examples/black/colors-example-black.component.html');
  colorsBlackExampleComponent: string = require('!!raw-loader!./examples/black/colors-example-black.component.ts');

  colorsWhiteExampleTemplate: string = require('!!raw-loader!./examples/white/colors-example-white.component.html');
  colorsWhiteExampleComponent: string = require('!!raw-loader!./examples/white/colors-example-white.component.ts');

  colorsPrimaryExampleTemplate: string = require('!!raw-loader!./examples/primary/colors-example-primary.component.html');
  colorsPrimaryExampleComponent: string = require('!!raw-loader!./examples/primary/colors-example-primary.component.ts');
}
