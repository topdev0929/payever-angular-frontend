import { Component, ChangeDetectionStrategy, Injector, inject } from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { NodePaymentDetailsResponseInterface } from '../../types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-direct-debit-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {
  protected customElementService = inject(CustomElementService);

  constructor(injector: Injector) {
    super(injector);
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['checkmark-32', 'x-round-white-cross-24', 'error-128'],
      null,
      this.customElementService.shadowRoot
    );
  }

  isStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].indexOf(this.status) >= 0;
  }

  isStatusPending(): boolean {
    return [
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.status) >= 0;
  }

  isStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].indexOf(this.status) >= 0;
  }

  getNodeResultDetails(): NodePaymentDetailsResponseInterface {
    return this.nodeResult.paymentDetails;
  }
}
