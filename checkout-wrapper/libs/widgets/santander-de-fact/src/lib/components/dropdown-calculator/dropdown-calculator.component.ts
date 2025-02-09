import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-fact-de-dropdown-calculator',
  templateUrl: './dropdown-calculator.component.html',
  styleUrls: ['./dropdown-calculator.component.scss'],
})
export class DropdownCalculatorComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.DropdownCalculator;
}
