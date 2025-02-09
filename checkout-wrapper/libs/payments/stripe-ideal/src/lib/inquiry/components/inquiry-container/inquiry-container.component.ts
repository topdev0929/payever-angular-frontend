import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RateDetailInterface } from '@pe/checkout/rates';
import { FlowStorage } from '@pe/checkout/storage';
import {
  NodePaymentResponseInterface,
  TimestampEvent,
} from '@pe/checkout/types';
import { PE_ENV } from '@pe/common';

import {
  BaseContainerComponent,
  FormOptionsInterface,
  NodePaymentResponseDetailsInterface,
} from '../../../shared';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-ideal-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  styleUrls: ['./inquiry-container.component.scss'],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  isSendingPayment = false;
  finishModalErrorMessage: string;
  nodeResult: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  private flowStorage = this.injector.get(FlowStorage);
  private env = this.injector.get(PE_ENV);

  public readonly transformedIdealBanks$: Observable<RateDetailInterface[]> = this.nodeFormOptions$.pipe(
    map((nodeFormOptions: FormOptionsInterface) => nodeFormOptions?.idealBanks.map(bank => ({
      id: bank.value,
      title: bank.label,
      svgIconUrl: `${this.env.custom.cdn}/icons-ideal/${bank.value}.svg`,
    })))
  );

  get initialBank(): string {
    return this.flowStorage.getData(this.flow.id, 'idealBank', null);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.buttonText.next($localize`:@@payment-stripe-ideal.inquiry.payment.text:`);
  }

  bankSelected(bank: string): void {
    this.buttonText.next($localize`:@@payment-stripe-ideal.actions.pay:`);
    this.flowStorage.setData(this.flow.id, 'idealBank', bank);
  }

  triggerSubmit(): void {
    if (this.flowStorage.getData(this.flow.id, 'idealBank', null)) {

      this.continue.emit();
    }
  }
}
