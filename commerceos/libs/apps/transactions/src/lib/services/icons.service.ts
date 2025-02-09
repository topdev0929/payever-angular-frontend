import { Injectable } from '@angular/core';

import { EnvService } from '@pe/common';

import { PaymentType } from '../shared';

import { ValuesService } from './values.service';

@Injectable()
export class IconsService {

  constructor(
    private valuesService: ValuesService,
    private envService: EnvService
  ) {
  }

  getChannelIconId(channelType: string): string {
    const channel = this.valuesService.channels[channelType];

    return channel?.icon || '#channel-link';
  }

  getThumbnailChannelIconId(channelType: string): string {
    return this.getChannelIconId(channelType);
  }

  getPaymentMethodIconId(paymentType: PaymentType): string {
    const payment = this.valuesService.payments[paymentType];

    return payment?.icon || '#payment-method-santander';
  }
}
