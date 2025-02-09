import { Component, ChangeDetectionStrategy, HostBinding, Injector, Input, TemplateRef } from '@angular/core';

import { IconsHelperService } from '../../../services';
import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-header-santander',
  templateUrl: './header-santander.component.html',
  styleUrls: ['./header-santander.component.scss'],
})
export class UIHeaderSantanderComponent extends UIBaseComponent {
  @Input() logoTemplate: TemplateRef<unknown>;

  @HostBinding('style.color') headerTextColor: string = null;

  onUpdateStyles(): void {
    this.headerTextColor = this.currentStyles?.headerTextColor || this.default.styles.headerTextColor;
  }

  constructor(
    protected injector: Injector,
    protected iconsHelperService: IconsHelperService
  ) {
    super(injector);

    this.iconsHelperService.registerIcons([
      'santander-bank',
    ]);
  }
}
