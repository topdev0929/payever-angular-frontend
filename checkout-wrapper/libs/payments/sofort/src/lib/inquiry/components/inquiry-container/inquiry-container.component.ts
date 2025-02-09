import {
  ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output,
} from '@angular/core';

import { TopLocationService } from '@pe/checkout/location';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { TimestampEvent, FlowStateEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PE_ENV } from '@pe/common/core';

import {
  BaseContainerComponent,
  NodePaymentDetailsInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sofort-inquiry-container',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  protected env = this.injector.get(PE_ENV);
  protected externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  protected windowTopLocation = this.injector.get(TopLocationService);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);

  ngOnInit(): void {
    this.buttonText.next($localize `:@@payment-sofort.actions.redirect_to_sofort:`);
    this.onServiceReady.emit(true);
  }

  triggerSubmit(): void {
    this.onSend({});
  }

  onSend(formData: unknown): void {
    if (this.isFlowHasFinishedPayment()) {
      this.showFinishModalFromExistingPayment();
    } else {
      this.sendPaymentData(formData);
    }
  }

  isFlowHasFinishedPayment(): boolean {
    return Boolean(this.flow && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  showFinishModalFromExistingPayment(): void {
    this.continue.next();
  }

  protected sendPaymentData(formData: unknown): void {
    const nodePaymentDetails: NodePaymentDetailsInterface = prepareData(formData);

    this.nodeFlowService.setPaymentDetails(nodePaymentDetails);

    this.continue.emit();
  }
}
