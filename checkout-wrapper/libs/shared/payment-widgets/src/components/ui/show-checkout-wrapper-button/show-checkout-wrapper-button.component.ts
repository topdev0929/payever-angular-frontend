import { Component, ChangeDetectionStrategy, Output, EventEmitter, HostBinding } from '@angular/core';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-show-checkout-wrapper-button',
  templateUrl: './show-checkout-wrapper-button.component.html',
  styleUrls: ['./show-checkout-wrapper-button.component.scss'],
})
export class UIShowCheckoutWrapperButtonComponent extends UIBaseComponent {

  @Output('clicked') clickedEmitter: EventEmitter<void> = new EventEmitter();

  @HostBinding('style.color') ctaTextColor: string = null;

  onClick(): void {
    this.clickedEmitter.emit();
  }

  onUpdateStyles(): void {
    this.ctaTextColor = this.currentStyles?.ctaTextColor || this.default.styles.ctaTextColor;
  }
}
