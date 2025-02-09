import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import {
  TimestampEvent,
} from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'allianz-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  ngOnInit(): void {
    this.buttonText.next($localize `:@@payment-allianz.actions.pay:`);
  }

  triggerSubmit(): void {
    this.onSend({});
  }

  onSend(formData: FormInterface): void {
    this.sendPaymentData(formData);
  }

  protected sendPaymentData(formData: FormInterface): void {

    this.nodeFlowService.setPaymentDetails(formData);
    this.continue.emit();
  }
}
