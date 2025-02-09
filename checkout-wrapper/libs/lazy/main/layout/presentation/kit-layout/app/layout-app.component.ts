import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CustomElementService } from '@pe/checkout/utils';

@Component({
  selector: 'pe-layout-app',
  styleUrls: ['layout-app.component.scss'],
  templateUrl: './layout-app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutAppKitComponent {
  @Input() fullView = false;
  @Input() staticBlockView = false;
  @Input() fixedPositionView = false;
  @Input() layoutWithPaddings = false;

  constructor(
    protected customElementService: CustomElementService
  ) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(['x-16'], null, this.customElementService.shadowRoot);
  }
}
