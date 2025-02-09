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

import {
  BaseContainerComponent,
  FormInterface,
} from '../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-be-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  styles: [':host { display: block; }'],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  ngOnInit(): void {
    this.buttonText.next($localize `:@@payment-santander-be.actions.redirect_to_santander_be:`);
    this.onServiceReady.emit(true);
  }

  triggerSubmit(): void {
    this.onSend({});
  }

  onSend(formData: FormInterface): void {
    this.sendPaymentData(formData);
  }

  private sendPaymentData(formData: FormInterface): void {
    this.nodeFlowService.setPaymentDetails(formData);
    this.continue.emit();
  }
}
