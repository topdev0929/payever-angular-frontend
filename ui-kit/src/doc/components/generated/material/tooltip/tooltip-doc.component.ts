import { Component } from '@angular/core';

@Component({
  selector: 'doc-tooltip',
  templateUrl: './tooltip-doc.component.html'
})
export class TooltipDocComponent {
  tooltipDefaultExampleTemplate: string = require('!!raw-loader!./examples/default/tooltip-example-default.component.html');
  tooltipDefaultExampleComponent: string = require('!!raw-loader!./examples/default/tooltip-example-default.component.ts');
}
