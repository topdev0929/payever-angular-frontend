import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-nl-dropdown-calculator',
  templateUrl: './dropdown-calculator.component.html',
  styleUrls: ['../../styles.scss'],
})
export class DropdownCalculatorComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.DropdownCalculator;
}
