import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { RateInterface } from '@pe/checkout/types';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-rate-text',
  templateUrl: './rate-text.component.html',
  styleUrls: ['./rate-text.component.scss'],
})
export class UIRateTextComponent extends UIBaseComponent {

  @Input() isLoading = false;
  @Input() error: string = null;
  @Input() rate: RateInterface = null;
  @Input() isShowSelectedRateDetails = true;
  @Input() numColumns = 2;

  mainTextColor: string = null;

  onUpdateStyles(): void {
    this.mainTextColor = this.currentStyles?.mainTextColor || this.default.styles.mainTextColor;
  }
}
