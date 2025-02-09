import {
  Component,
  ChangeDetectionStrategy,
  Output,
  OnInit,
  EventEmitter,
} from '@angular/core';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { TimestampEvent } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PE_ENV } from '@pe/common/core';

import {
  BaseContainerComponent,
  FormInterface,
  NodePaymentDetailsInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'swedbank-inquiry-container',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;
  errorMessage: string = null;
  swedbankRunning = false;


  private submit$ = this.injector.get(PaymentSubmissionService);


  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();
  @Output() buttonHidden: EventEmitter<boolean> = new EventEmitter();
  @Output() flowIsBroken: EventEmitter<boolean> = new EventEmitter();
  @Output() fullWidthMode: EventEmitter<boolean> = new EventEmitter();

  protected env = this.injector.get(PE_ENV);
  protected externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);

  ngOnInit(): void {
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.buttonText.next($localize `:@@swedbank.action.next:`);
    this.onServiceReady.emit(true);
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  onSend(formData: Partial<FormInterface>): void {
    this.sendPaymentData(formData);
  }

  showFinishModalFromExistingPayment(): void {
    this.continue.next();
  }

  protected sendPaymentData(formData: FormInterface): void {

    const nodePaymentDetails: NodePaymentDetailsInterface = prepareData(formData);

    this.nodeFlowService.assignPaymentDetails(
      nodePaymentDetails.phone
        ? { address: { phone: nodePaymentDetails.phone } }
        : null,
      );
    this.nodeFlowService.setPaymentDetails(nodePaymentDetails);

    this.continue.emit();
  }
}
