import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-top-text',
  templateUrl: './top-text.component.html',
  styleUrls: ['./top-text.component.scss'],
})
export class UITopTextComponent extends UIBaseComponent {

  @HostBinding('style.color') regularTextColor: string = null;

  onUpdateStyles(): void {
    this.regularTextColor = this.currentStyles?.regularTextColor || this.default.styles.regularTextColor;
  }
}
