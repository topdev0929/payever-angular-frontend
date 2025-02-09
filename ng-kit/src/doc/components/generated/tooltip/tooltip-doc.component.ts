import { Component } from '@angular/core';

@Component({
  selector: 'doc-tooltip',
  templateUrl: './tooltip-doc.component.html'
})
export class TooltipDocComponent {
  htmlExample: string = require('!!raw-loader!./examples/tooltip-example.component.html');
  tsExample: string = require('!!raw-loader!./examples/tooltip-example.component.ts');
}
