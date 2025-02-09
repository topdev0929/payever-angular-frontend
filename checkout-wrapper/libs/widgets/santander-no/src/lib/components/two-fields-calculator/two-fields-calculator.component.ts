import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-no-two-fields-calculator',
  templateUrl: './two-fields-calculator.component.html',
  styleUrls: ['./two-fields-calculator.component.scss'],
})
export class TwoFieldsCalculatorComponent extends BaseWidgetComponent {
  readonly isTwoFieldsCalculator = true;
  readonly widgetType = WidgetTypeEnum.TwoFieldsCalculator;

  get translations(): any {
    return {
      ...super.translations,
      headerText: this.isBNPL
        ? $localize `:@@santander-no-finexp-widget.bnpl.calculator.header_text:`
        : $localize `:@@santander-no-finexp-widget.regular.calculator.header_text:`,
    };
  }
}
