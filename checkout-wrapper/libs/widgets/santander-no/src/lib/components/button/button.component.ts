import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-no-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.Button;
}
