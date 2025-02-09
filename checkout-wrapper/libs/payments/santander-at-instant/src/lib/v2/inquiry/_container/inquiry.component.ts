import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { defer, of } from 'rxjs';

import { AbstractPaymentContainerComponent, PaymentSubmissionService } from '@pe/checkout/payment';

import { FormInterface } from '../../../shared';
import { InquiryFormComponent } from '../_form';

@Component({
  selector: 'pe-santander-at-instant-inquiry-container',
  template: `
    <div
      class="pe-payment-container"
      *ngIf="nodeFormOptions$ | async">
      <pe-santander-at-instant-inquiry-form (submitted)="onSend($event)"></pe-santander-at-instant-inquiry-form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    InquiryFormComponent,
    NgIf,
    AsyncPipe,
  ],
})
export class InquiryContainerComponent extends AbstractPaymentContainerComponent {
  private submit$ = inject(PaymentSubmissionService);

  @Output() continue = new EventEmitter<void>();
  @Output() buttonText = defer(() =>
    of($localize `:@@payment-santander-instant-at.actions.pay:Pay`));

  protected triggerSubmit() {
    this.submit$.next();
  }

  onSend(formData: Partial<FormInterface>): void {
    this.sendPaymentData(formData);
    this.continue.next();
  }

  protected sendPaymentData(formData: Partial<FormInterface>): void {
    this.nodeFlowService.setPaymentDetails(formData);
  }
}
