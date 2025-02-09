import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Subject } from 'rxjs';

import { TrackingService } from '@pe/checkout/api';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { RateAccordionDetailInterface } from '../../types';

@Component({
  selector: 'checkout-sdk-choose-rate-accordion',
  templateUrl: 'choose-rate-accordion.component.html',
  styleUrls: ['choose-rate-accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseRateAccordionComponent {

  @Input() trackFlowId: string; // For statistic tracking
  @Input() trackPaymentMethod: PaymentMethodEnum; // For statistic tracking

  @Input() rates: RateAccordionDetailInterface[];
  @Input() isLoading: boolean;
  @Input() initialRateId: string;
  @Input() doSelectRate: Subject<string>;

  @Output() rateSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() panelOpened: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private trackingService: TrackingService
  ) {}

  onRateClicked(rateId: string): void {
    this.trackingService?.doEmitRateSelected(this.trackFlowId, this.trackPaymentMethod, rateId);
  }
}
