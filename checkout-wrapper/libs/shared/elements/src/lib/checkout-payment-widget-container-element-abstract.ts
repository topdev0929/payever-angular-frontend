import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Injector,
  Input,
  Output,
} from '@angular/core';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  TimestampEvent,
  TimestampEventWithPayload,
  FlowInterface,
  ChangePaymentDataInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

@Directive()
export abstract class CheckoutPaymentWidgetContainerElementAbstract
  implements AfterViewInit {

  abstract readonly paymentMethod: PaymentMethodEnum;

  @Input() flow: FlowInterface = null;
  @Input() submit: TimestampEvent = null;
  @Input() sendPayment: TimestampEvent = null;
  @Input() embeddedMode = false;
  @Input() merchantMode = false;
  @Input() showSubmitButton = true;

  @Output('requestFlowData') onRequestFlowDataEmitter: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output('submitted') submittedEmitter: EventEmitter<TimestampEventWithPayload<() => void>> = new EventEmitter();
  @Output('buttonText') buttonTextEmitter: EventEmitter<string> = new EventEmitter();
  @Output('loading') loadingEmitter: EventEmitter<boolean> = new EventEmitter();

  @Output('serviceReady') serviceReadyEmitter: EventEmitter<any> = new EventEmitter();

  buttonText: string = null;

  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected storage: PaymentInquiryStorage = this.injector.get(PaymentInquiryStorage);

  constructor(protected injector: Injector) {}

  ngAfterViewInit(): void {
    this.serviceReadyEmitter.emit(true);
  }

  doSubmit(): void {
    this.submit = new TimestampEvent();
  }

  doSendPayment(): void {
    this.sendPayment = new TimestampEvent();
  }

  onButtonText(text: string): void {
    this.buttonTextEmitter.next(text);
    this.buttonText = text;
  }

  requestFlowData(): void {
    this.onRequestFlowDataEmitter.next();
  }

  serviceReady(event: any): void {
    this.serviceReadyEmitter.emit(event);
  }

  onChangePaymentMethod(data: ChangePaymentDataInterface): void {
    if (data?.redirectUrl) {
      window.top.location.href = data.redirectUrl;
    } else {
      throw new Error('Invalid data for change payment call');
    }
  }
}
