import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'widget-ivy',
  templateUrl: './custom-element.component.html',
  styleUrls: ['./custom-element.component.scss'],
})
export class IvyCustomElementComponent extends BaseWidgetCustomElementComponent {

  public readonly translations = {
    noWidget: $localize `:@@ivy-finexp-widget.noWidget:Only button widget is supported for Ivy`,
  };
}
