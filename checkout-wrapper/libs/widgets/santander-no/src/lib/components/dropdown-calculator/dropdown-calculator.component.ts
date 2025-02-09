import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-no-dropdown-calculator',
  templateUrl: './dropdown-calculator.component.html',
  styleUrls: ['./dropdown-calculator.component.scss'],
})
export class DropdownCalculatorComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.DropdownCalculator;

  get translations(): any {
    return {
      ...super.translations,
      headerText: this.isBNPL
        ? $localize `:@@santander-no-finexp-widget.bnpl.calculator.header_text:`
        : $localize `:@@santander-no-finexp-widget.regular.calculator.header_text:`,
    };
  }
}
