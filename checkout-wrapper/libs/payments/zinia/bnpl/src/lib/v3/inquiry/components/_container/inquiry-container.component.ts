import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, EventEmitter, Output, inject,
} from '@angular/core';
import { switchMap, tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PatchFlow } from '@pe/checkout/store';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import {
  FlowStateEnum,
  NodePaymentResponseInterface,
} from '@pe/checkout/types';

import { BaseInquiryContainerComponent } from '../../../../shared';
import { FormValue, PaymentDetails } from '../../../models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ CurrencyPipe ],
  selector: 'zinia-bnpl-inquiry-container-v3',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseInquiryContainerComponent {

  isSendingPayment = false;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  nodePaymentResponse: NodePaymentResponseInterface<PaymentResponse> = null;

  protected threatMetrixService = inject(ThreatMetrixService);
  private paymentSubmissionService = inject(PaymentSubmissionService);

  triggerSubmit(): void {
    this.paymentSubmissionService.next();
  }

  onSend(formData: any): void {
    if (this.isFlowHasFinishedPayment()) {
      this.showFinishModalFromExistingPayment();
    } else {
      this.initPaymentDetails(formData);
    }
  }

  isFlowHasFinishedPayment(): boolean {
    return Boolean(this.flow && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  showFinishModalFromExistingPayment(): void {
    this.continue.next();
  }

  protected initPaymentDetails(formData: FormValue): void {
    const nodePaymentDetails: Partial<PaymentDetails> = {
      birthday: formData.detailsForm.birthday,
      phone: formData.detailsForm.phone ?? this.flow.billingAddress.phone,
      customer: formData.termsForm,
    };

    this.store.dispatch(new PatchFlow({
      billingAddress: {
        ...this.flow.billingAddress,
        phone: nodePaymentDetails.phone,
      },
    })).pipe(
      switchMap(() => this.nodeFlowService.assignPaymentDetails(nodePaymentDetails)),
      tap(() => {
        this.continue.next();
      }),
    ).subscribe();
  }
}
