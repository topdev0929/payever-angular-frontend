import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'widget-santander-dk-custom-element',
  templateUrl: './custom-element.component.html',
  styleUrls: ['./custom-element.component.scss'],
})
export class SantanderDkCustomElementComponent extends BaseWidgetCustomElementComponent {}
