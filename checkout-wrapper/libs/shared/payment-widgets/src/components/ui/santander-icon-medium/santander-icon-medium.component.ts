import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';

import { IconsHelperService } from '../../../services';
import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-santander-icon-medium',
  template: `
    <mat-icon
      class="payever-icon"
      svgIcon="santander-medium"
    ></mat-icon>
  `,
  styles: [`
  :host {
    font-family: Roboto, sans-serif;
    display: inline-block;
    margin-right: 6px;
  }
  .payever-icon {
    width: 95px;
    height: 20px;
  }
  `],
})
export class UISantanderIconMediumComponent extends UIBaseComponent {
  constructor(
    protected injector: Injector,
    protected iconsHelperService: IconsHelperService
  ) {
    super(injector);

    this.iconsHelperService.registerIcons([
      'santander-medium',
    ]);
  }
}
