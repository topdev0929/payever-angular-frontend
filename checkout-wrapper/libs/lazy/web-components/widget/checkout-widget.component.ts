import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  ViewEncapsulation,
  ChangeDetectorRef,
  HostBinding,
} from '@angular/core';

import { FinExpApiCallInterface } from '@pe/checkout/api';
import {
  AddressInterface,
  CustomWidgetConfigInterface,
  PaymentItem,
  PaymentWidgetEnum,
  ShippingOption,
  WidgetTypeEnum,
} from '@pe/checkout/types';
import { EnvironmentConfigInterface } from '@pe/common';

export interface FinExpCreateFlowParamsInterface {
  channelSetId: string;
  apiCallData: FinExpApiCallInterface;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ce-checkout-widget',
  templateUrl: './checkout-widget.component.html',
  styleUrls: [
    './checkout-widget.component.scss',
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class CheckoutWidgetComponent {

  @Input() channelSet: string;

  @Input() type: WidgetTypeEnum;

  @Input() amount: number;

  @Input() isDebugMode: boolean;

  @Input() env: EnvironmentConfigInterface;

  @Input() config: CustomWidgetConfigInterface;

  @Input() paymentMethod: PaymentWidgetEnum;

  @Input() cart: PaymentItem[];

  @Input() billingAddress: AddressInterface;

  @Input() shippingAddress: AddressInterface;

  @Input() shippingOption: ShippingOption;

  @Input() theme: 'light' | 'dark';

  @Output() clicked = new EventEmitter<void>();

  @HostBinding('style.--alignment') get alignment() {
    return this.config.alignment;
  }

  public readonly cdr = inject(ChangeDetectorRef);
}
