import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { AbstractFinishContainer, AbstractFinishContainerComponent } from '@pe/checkout/finish';
import {
  FlowStateEnum,
} from '@pe/checkout/types';

@Component({
  selector: 'santander-de-fact-finish-container',
  templateUrl: './finish-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinishContainerComponent
 extends AbstractFinishContainerComponent
 implements AbstractFinishContainer, OnInit {

  isSendingPayment: boolean;

  get isPaymentComplete(): boolean {
    return Boolean(this.flow && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
  }
}
