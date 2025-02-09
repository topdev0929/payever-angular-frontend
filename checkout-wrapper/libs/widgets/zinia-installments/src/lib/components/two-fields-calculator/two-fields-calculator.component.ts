import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-zinia-installments-two-fields-calculator',
  templateUrl: './two-fields-calculator.component.html',
  styleUrls: ['./two-fields-calculator.component.scss'],
})
export class TwoFieldsCalculatorComponent extends BaseWidgetComponent {
  readonly isTwoFieldsCalculator = true;
  readonly widgetType = WidgetTypeEnum.TwoFieldsCalculator;
}
