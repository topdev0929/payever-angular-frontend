import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'pe-payment-text',
  templateUrl: './payment-text.component.html',
  styleUrls: ['./payment-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentTextComponent {
  @Input() type: 'text' | 'line' | 'html' = 'text';
  @Input() marginBottom = false;
  @Input() defaultMargin = false;
  @Input() fixMarginTop = false;
  @Input() textIndent = false;
  @Input() customMarginTop: number = null;

  @HostBinding('style.margin-top.px') get customMarginTopValue(): number {
    return this.customMarginTop;
  }

  @HostBinding('class') get defaultMarginValue(): {[key: string]: boolean} {
    return {
      'default-margin': this.defaultMargin,
      'fix-margin-top': this.fixMarginTop,
    };
  }
}
