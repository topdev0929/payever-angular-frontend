import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

import { BaseWidgetCustomElementComponent } from '@pe/checkout/payment-widgets';
import { PaymentMethodEnum, WidgetTypeEnum } from '@pe/checkout/types';
import { isDeviceAllowed } from '@pe/checkout/utils/device';

import { StripeWalletWidgetComponent } from './widget';

@Component({
  selector: 'pe-stripe-wallet',
  templateUrl: './stripe-wallet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    StripeWalletWidgetComponent,
  ],
})
export class StripeWalletComponent extends BaseWidgetCustomElementComponent {
  private readonly deviceDetector = inject(DeviceDetectorService);

  private readonly translations = {
    noWidget: {
      [PaymentMethodEnum.GOOGLE_PAY]: $localize `:@@stripe-wallet-finexp-widget.google-pay.no-widget: Google Pay is not supported for this type of payment`,
      [PaymentMethodEnum.APPLE_PAY]: $localize `:@@stripe-wallet-finexp-widget.apple-pay.no-widget: Apple Pay is not supported for this type of payment`,
    } as { [key in PaymentMethodEnum]: string },
  };

  protected get isAllowed() {
    return this.type === WidgetTypeEnum.Button
      && isDeviceAllowed(this.deviceDetector, this.paymentMethod) || this.config?.previewPayment === this.paymentMethod;
  }

  protected get error() {
    return this.translations.noWidget[this.paymentMethod];
  }
}
