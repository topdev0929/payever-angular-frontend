import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';

import { IconsHelperService } from '../../../services';
import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-zinia-icon',
  template: `
  <mat-icon
    class="payever-icon"
    svgIcon="zinia"
  ></mat-icon>
  `,
  styles: [`
    :host {
      font-family: Roboto, sans-serif;
      display: inline-block;
      height: 20px;
      margin-right: 12px;
    }
    .payever-icon {
      display: flex;
      width: 44px;
      height: 20px;
    }
  `],
})
export class UIZiniaIconComponent extends UIBaseComponent {
  constructor(
    protected injector: Injector,
    protected iconsHelperService: IconsHelperService
  ) {
    super(injector);

    this.iconsHelperService.registerIcons([
      'zinia',
    ]);
  }
}
