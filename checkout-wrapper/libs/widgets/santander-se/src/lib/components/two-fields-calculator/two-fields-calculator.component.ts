import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-se-two-fields-calculator',
  templateUrl: './two-fields-calculator.component.html',
  styleUrls: ['./two-fields-calculator.component.scss'],
})
export class TwoFieldsCalculatorComponent extends BaseWidgetComponent {
  readonly isTwoFieldsCalculator: boolean = true;
  readonly widgetType = WidgetTypeEnum.TwoFieldsCalculator;

  public get translations(): any {
    return {
      ...super.translations,
      headerText: this.isBNPL
        ? $localize `:@@santander-se-finexp-widget.bnpl.calculator.header_text:`
        : $localize `:@@santander-se-finexp-widget.regular.calculator.header_text:`,
      headerExtendedText: this.isBNPL
        ? $localize `:@@santander-se-finexp-widget.bnpl.calculator.header_text_extended:`
        : $localize `:@@santander-se-finexp-widget.regular.calculator.header_text_extended:`,
    };
  }
}
