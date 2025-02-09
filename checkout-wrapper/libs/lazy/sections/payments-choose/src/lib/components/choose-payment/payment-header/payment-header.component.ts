import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { map } from 'rxjs/operators';

import { FlowInterface, ViewPaymentOption } from '@pe/checkout/types';
import { WindowSizesService } from '@pe/checkout/window';


@Component({
  selector: 'choose-payment-header',
  templateUrl: './payment-header.component.html',
  styleUrls: ['./payment-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChoosePaymentHeaderComponent {

  @Input() flow: FlowInterface;

  @Input() paymentOption: ViewPaymentOption;

  @Input() selectedPayment: ViewPaymentOption;

  @Input() disabled: boolean;

  @Input() ready: boolean;

  @Output() paymentChange = new EventEmitter<ViewPaymentOption>();

  logoSettings$ = this.peWindowService.isMobile$.pipe(
    map(isMobile => ({
      className: `${isMobile ? 'visible-xs' : 'hidden-xs'} payment-option-icon`,
      isSmall: isMobile,
    })),
  );

  constructor(private peWindowService: WindowSizesService) {}

  get showFee(): boolean {
    return this.paymentOption.showFee && !this.paymentOption.merchantCoversFee;
  }

  paymentChanged(paymentOption: ViewPaymentOption): void {
    this.paymentChange.emit(paymentOption);
  }
}
