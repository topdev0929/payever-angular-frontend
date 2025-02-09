import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'widget-santander-no-custom-element',
  templateUrl: './custom-element.component.html',
  styleUrls: ['./custom-element.component.scss'],
})
export class SantanderNoCustomElementComponent extends BaseWidgetCustomElementComponent {}
