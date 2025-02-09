import { Component } from '@angular/core';
import { TooltipPosition } from '../../../../../kit/tooltip';

@Component({
  selector: 'doc-tooltip-example',
  templateUrl: './tooltip-example.component.html'
})
export class TooltipExampleComponent {
  tooltipMessage: string = 'Tooltip message';
  tooltipPosition: TooltipPosition = 'below';
}
