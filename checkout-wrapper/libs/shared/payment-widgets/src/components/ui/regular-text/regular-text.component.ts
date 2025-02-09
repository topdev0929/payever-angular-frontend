import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-regular-text',
  templateUrl: './regular-text.component.html',
  styleUrls: ['./regular-text.component.scss'],
})
export class UIRegularTextComponent extends UIBaseComponent {

  @HostBinding('style.color') regularTextColor: string = null;

  onUpdateStyles(): void {
    this.regularTextColor = this.currentStyles?.regularTextColor || this.default.styles.regularTextColor;
  }
}
