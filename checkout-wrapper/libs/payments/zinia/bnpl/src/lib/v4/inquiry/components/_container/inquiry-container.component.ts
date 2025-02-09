import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject,
} from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { ForceOpenFinishStep, PatchFlow, SetPaymentComplete, SetPaymentError } from '@pe/checkout/store';
import {
  FlowStateEnum,
  NodePaymentResponseInterface,
} from '@pe/checkout/types';

import { BaseInquiryContainerComponent } from '../../../../shared';
import { FormValue, PaymentDetails } from '../../../models';
import { ZiniaBnplFlowService, ZiniaPaymentService } from '../../../services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ CurrencyPipe ],
  selector: 'zinia-bnpl-inquiry-container-v4',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseInquiryContainerComponent implements OnInit {
  isSendingPayment = false;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  nodePaymentResponse: NodePaymentResponseInterface<PaymentResponse> = null;

  private paymentSubmissionService = inject(PaymentSubmissionService);
  private ziniaBNPLFlowService = inject(ZiniaBnplFlowService);
  private ziniaPaymentService = inject(ZiniaPaymentService);

  get isPos(): boolean {
    return false;
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.threatMetrixService.nodeInitFor(
      this.flow.id,
      this.flow.connectionId,
      this.paymentMethod,
    ).subscribe();

    this.buttonText.next($localize`:@@payment-openbank.actions.pay:`);
  }

  triggerSubmit(): void {
    this.paymentSubmissionService.next();
  }

  onSend(formData: any): void {
    if (this.isFlowHasFinishedPayment()) {
      this.updateInfo(formData);
    } else {
      this.initPaymentDetails(formData).pipe(
        tap(() => {
          this.continue.next();
        }),
      ).subscribe();
    }
  }

  isFlowHasFinishedPayment(): boolean {
    return Boolean(this.flow && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  updateInfo(formData: any): void {
    this.initPaymentDetails(formData).pipe(
      switchMap(() => this.ziniaPaymentService.preparePayment(this.flow).pipe(
        tap(() => this.paymentHelperService.setPaymentLoading(true)),
        switchMap(() => this.ziniaBNPLFlowService.updateInfo().pipe(
          tap(() => this.store.dispatch(new SetPaymentComplete())),
          catchError(err => this.store.dispatch(new SetPaymentError(err)).pipe(
            switchMap(() => this.store.dispatch(new SetPaymentComplete())),
          )),
          finalize(() => {
            this.paymentHelperService.setPaymentLoading(false);
            this.store.dispatch(new ForceOpenFinishStep());
          }),
        ))
      ))
    ).subscribe();
  }

  protected initPaymentDetails(formData: FormValue): Observable<void> {
    const nodePaymentDetails: Partial<PaymentDetails> = {
      birthday: formData.detailsForm.birthday,
      phone: formData.detailsForm.phone,
      customer: formData.termsForm,
    };

    return this.store.dispatch(new PatchFlow({
      billingAddress: {
        ...this.flow.billingAddress,
        phone: nodePaymentDetails.phone,
      },
    })).pipe(
      switchMap(() => this.nodeFlowService.assignPaymentDetails(nodePaymentDetails)),
    );
  }
}
