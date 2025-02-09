import {
  Component, ChangeDetectionStrategy,
} from '@angular/core';

// eslint-disable-next-line
import { CheckoutPaymentWidgetContainerElementAbstract } from '@pe/checkout/elements';
import { PaymentMethodEnum, TimestampEventWithPayload } from '@pe/checkout/types';

/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-nl-embedded-container',
  templateUrl: './embedded-container.component.html',
  styleUrls: ['./embedded-container.component.scss'],
})
export class EmbeddedContainerComponent extends CheckoutPaymentWidgetContainerElementAbstract {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INSTALLMENT_NL;

  isPaymentFinished = false;

  onSubmitted(): void {
    this.submittedEmitter.emit(new TimestampEventWithPayload(() => {
      this.doSendPayment();
    }));
  }

  onPaymentCreated(): void {
    this.isPaymentFinished = true;
    this.cdr.detectChanges();
  }
}
