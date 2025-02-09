import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WidgetTypeEnum } from '@pe/checkout/types';

import { BaseWidgetComponent } from '../base-widget.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'widget-santander-at-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent extends BaseWidgetComponent {
  readonly isRateTextTitle = true;
  readonly widgetType = WidgetTypeEnum.Text;
}
