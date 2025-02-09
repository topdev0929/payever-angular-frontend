import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-nl-button',
  templateUrl: './button.component.html',
  styleUrls: ['../../styles.scss'],
})
export class ButtonComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.Button;
}
