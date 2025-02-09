import {
  Component,
  ChangeDetectionStrategy,
  Output,
  OnInit,
  EventEmitter,
} from '@angular/core';

import {
  NodePaymentResponseInterface,
  TimestampEvent,
} from '@pe/checkout/types';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  NodePaymentDetailsInterface,
   NodePaymentDetailsResponseInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-fi-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  nodePaymentResponse: NodePaymentResponseInterface<NodePaymentDetailsResponseInterface> = null;

  ngOnInit(): void {
    this.buttonText.next($localize `:@@payment-santander-fi.actions.pay:`);
    this.onServiceReady.emit(true);
  }

  triggerSubmit(): void {
    this.onSend({});
  }

  onSend(formData: unknown): void {
    this.sendPaymentData(formData);
  }

  protected sendPaymentData(formData: unknown): void {
    const nodePaymentDetails: NodePaymentDetailsInterface = prepareData(formData);

    this.nodeFlowService.setPaymentDetails(nodePaymentDetails);

    this.continue.emit();
  }
}
