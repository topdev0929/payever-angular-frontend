import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-at-dropdown-calculator',
  templateUrl: './dropdown-calculator.component.html',
  styleUrls: ['./dropdown-calculator.component.scss'],
})
export class DropdownCalculatorComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.DropdownCalculator;
}
