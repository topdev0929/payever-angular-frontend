import { Component, ChangeDetectionStrategy } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-nl-text',
  templateUrl: './text.component.html',
  styleUrls: ['../../styles.scss'],
})
export class TextComponent extends BaseWidgetComponent {
  readonly widgetType = WidgetTypeEnum.Text;
}
