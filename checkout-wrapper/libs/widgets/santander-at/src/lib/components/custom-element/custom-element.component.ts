import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'widget-santander-at-custom-element',
  templateUrl: './custom-element.component.html',
  styleUrls: ['./custom-element.component.scss'],
})
export class SantanderAtCustomElementComponent extends BaseWidgetCustomElementComponent {}
