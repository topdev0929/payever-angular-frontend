import { Component, ChangeDetectionStrategy, Input, Injector } from '@angular/core';

import { IconsHelperService } from '../../../services';
import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-payever-icon',
  template: `<mat-icon
    [style.width.px]="width"
    class="payever-icon"
    svgIcon="payever"
  ></mat-icon>`,
  styles: [`
    :host, .payever-icon {
      height: 24px;
    }
  `],
})
export class UIPayeverIconComponent extends UIBaseComponent {
  @Input() width: number = null;

  constructor(
    protected injector: Injector,
    protected iconsHelperService: IconsHelperService
  ) {
    super(injector);

    this.iconsHelperService.registerIcons([
      'payever',
    ]);
  }
}
