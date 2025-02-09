import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';

import { IconsHelperService } from '../../../services';
import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-santander-icon-short',
  templateUrl: './santander-icon-short.component.html',
  styleUrls: ['./santander-icon-short.component.scss'],
})
export class UISantanderIconShortComponent extends UIBaseComponent {
  constructor(
    protected injector: Injector,
    protected iconsHelperService: IconsHelperService
  ) {
    super(injector);

    this.iconsHelperService.registerIcons([
      'santander-short',
    ]);
  }
}
