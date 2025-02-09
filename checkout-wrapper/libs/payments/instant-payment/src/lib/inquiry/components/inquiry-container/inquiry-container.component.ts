import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroupDirective, Validators } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { PaymentState } from '@pe/checkout/store';
import { TimestampEvent } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { BaseContainerComponent } from '../../../shared';
import { ibanValidator, instantPaymentIbanValidator } from '../../validators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'instant-payment-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  styleUrls: ['./inquiry-container.component.scss'],
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  @SelectSnapshot(PaymentState.form) paymentForm: any;

  @ViewChild(FormGroupDirective) private formGroupDirective: FormGroupDirective;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();

  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  private fb = this.injector.get(FormBuilder);

  public form = this.fb.group({
    senderHolder: [null, Validators.required],
    senderIban: [null, [Validators.required, ibanValidator, instantPaymentIbanValidator]],
    adsAgreement: [null],
  });

  public translations = {
    adsAgreement: $localize`:@@payment-instant-payment.inquiry.form.adsAgreement.label:`,
  };

  ngOnInit(): void {
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.buttonText.emit($localize `:@@payment-instant-payment.actions.pay:`);

    const sender = [this.flow.billingAddress?.firstName, this.flow.billingAddress?.lastName].filter(d => !!d).join(' ');
    const { senderHolder = null, senderIban = null, adsAgreement = false } = this.paymentForm || {};

    this.form.setValue({
      senderHolder: sender || senderHolder,
      senderIban: senderIban,
      adsAgreement: adsAgreement,
    }, { emitEvent: false });
  }

  triggerSubmit(): void {
    this.formGroupDirective.ngSubmit.emit();
    this.formGroupDirective.onSubmit(null);
    this.cdr.markForCheck();
    const { valid, value } = this.form;

    if (valid) {
      this.nodeFlowService.setPaymentDetails(value);
      this.continue.emit();
    }
  }
}
