import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-top-big-text',
  templateUrl: './top-big-text.component.html',
  styleUrls: ['./top-big-text.component.scss'],
})
export class UITopBigTextComponent extends UIBaseComponent {

  @HostBinding('style.color') regularTextColor: string = null;

  onUpdateStyles(): void {
    this.regularTextColor = this.currentStyles?.regularTextColor || this.default.styles.regularTextColor;
  }
}
