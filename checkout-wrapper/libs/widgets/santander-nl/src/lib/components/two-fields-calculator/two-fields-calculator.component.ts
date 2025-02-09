import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-nl-two-fields-calculator',
  templateUrl: './two-fields-calculator.component.html',
  styleUrls: ['../../styles.scss'],
})
export class TwoFieldsCalculatorComponent extends BaseWidgetComponent {
  readonly isTwoFieldsCalculator: boolean = true;
  readonly widgetType = WidgetTypeEnum.TwoFieldsCalculator;
}
