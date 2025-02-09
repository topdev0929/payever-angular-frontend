import { Component, Input, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '../../../../../shared';
import { StepEnum } from '../../../../../shared';
import { BasePaymentComponent } from '../base-payment.component';

@Component({
  selector: 'payment-external-registration',
  templateUrl: './payment-external-registration.component.html',
  styleUrls: ['./payment-external-registration.component.scss']
})
export class PaymentExternalRegistrationComponent extends BasePaymentComponent {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex: number = 0;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(injector: Injector) {
    super(injector);
  }

  onSubmit(): void {
    this.isLoading$.next(true);
    this.paymentsStateService.redirectToExternalRegistration(this.payment.variants[this.paymentIndex], this.getStep(StepEnum.registerUrl)).pipe(takeUntil(this.destroyed$)).subscribe(data => {}, () => {
      this.isLoading$.next(false);

      const message: string = this.translateService.translate('shopsystem.cant_make_external_redirection');
      this.showStepError(message);
    });
  }
}
