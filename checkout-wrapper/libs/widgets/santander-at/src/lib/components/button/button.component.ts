import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-at-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent extends BaseWidgetComponent {
  readonly isRateTextTitle = true;
  readonly widgetType = WidgetTypeEnum.Button;
}
