import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import {
  FlowStateEnum,
  TimestampEvent,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormInterface,
} from '../../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ivy-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  ngOnInit(): void {
    this.buttonText.next($localize `:@@actions.pay:`);
  }

  triggerSubmit(): void {
    this.onSend({});
  }

  onSend(formData: FormInterface): void {
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

  protected sendPaymentData(formData: FormInterface): void {
    this.nodeFlowService.setPaymentDetails(formData);
    this.continue.emit();
  }
}
