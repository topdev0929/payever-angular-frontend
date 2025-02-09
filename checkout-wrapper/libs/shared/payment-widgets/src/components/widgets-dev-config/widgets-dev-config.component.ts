import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  AfterViewInit,
  Output,
} from '@angular/core';
import { SessionStorage } from 'ngx-webstorage';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { keys, values } from '@pe/checkout/utils';

import { defaultCustomWidgetConfig } from '../../constants';
import {
  CheckoutModeEnum,
  CustomWidgetConfigInterface,
  RatesOrderEnum,
  WidgetConfigPaymentInterface,
} from '../../types';


@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'widgets-dev-config',
  templateUrl: './widgets-dev-config.component.html',
  styleUrls: ['./widgets-dev-config.component.scss'],
})
export class WidgetsDevConfigComponent implements AfterViewInit {

  @SessionStorage() initialChannelSet: string;
  @SessionStorage() initialAmount: number;
  @SessionStorage() initialIsDebugMode: boolean;
  @SessionStorage() initialLocale: string;
  @SessionStorage() initialConfig: CustomWidgetConfigInterface;

  @Output('channelSet') channelSetEmitter: EventEmitter<string> = new EventEmitter();
  @Output('amount') amountEmitter: EventEmitter<number> = new EventEmitter();
  @Output('isDebugMode') isDebugModeEmitter: EventEmitter<boolean> = new EventEmitter();
  @Output('locale') langEmitter: EventEmitter<string> = new EventEmitter();
  @Output('config') configEmitter: EventEmitter<CustomWidgetConfigInterface> = new EventEmitter();

  @Input() channelSet: string;
  @Input() amount: number;
  @Input() isDebugMode: boolean;
  @Input() locale: string;

  @Input() config: CustomWidgetConfigInterface = defaultCustomWidgetConfig();

  @Input() hasBNPL = true;

  readonly PaymentMethodEnum = PaymentMethodEnum;
  readonly CheckoutModeKeys: string[] = values(CheckoutModeEnum);
  readonly RatesOrderKeys: string[] = values(RatesOrderEnum);

  ngAfterViewInit(): void {
    if (this.initialChannelSet) {
      this.channelSet = this.initialChannelSet;
    }
    if (this.initialAmount) {
      this.amount = this.initialAmount;
    }
    if (this.initialIsDebugMode === true || this.initialIsDebugMode === false) {
      this.isDebugMode = this.initialIsDebugMode;
    } else {
      this.isDebugMode = true;
    }
    if (this.initialLocale) {
      this.locale = this.initialLocale;
    }
    if (this.initialConfig) {
      this.config = this.initialConfig;
    }
    this.onChange();
  }

  get styleKeys(): string[] {
    return keys(this.config.styles);
  }

  get currentPayment(): WidgetConfigPaymentInterface {
    return this.config?.payments?.find(a =>
      this.amount
        && a.enabled
        && this.amount >= a.amountLimits.min
        && this.amount <= a.amountLimits.max);
  }

  onChange(): void {
    this.channelSetEmitter.emit(this.channelSet);
    this.amountEmitter.emit(this.amount);
    this.isDebugModeEmitter.emit(this.isDebugMode);
    this.langEmitter.emit(this.locale);
    this.configEmitter.emit(this.config);

    this.initialChannelSet = this.channelSet;
    this.initialAmount = this.amount;
    this.initialIsDebugMode = this.isDebugMode;
    this.initialLocale = this.locale;
    this.initialConfig = this.config;
  }

  onChangeLang(locale: string): void {
    this.locale = locale;
    this.langEmitter.emit(this.locale);
    this.initialLocale = locale;
  }
}
