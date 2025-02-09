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

import { RateDetailInterface, RateToggleExtraDurationInterface } from '../../types';

@Component({
  selector: 'checkout-sdk-choose-rate',
  templateUrl: 'choose-rate.component.html',
  styleUrls: ['choose-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseRateComponent {

  @Input() trackFlowId: string; // For statistic tracking
  @Input() trackPaymentMethod: PaymentMethodEnum; // For statistic tracking

  @Input() previewAsSingleLine = false;
  @Input() rates: RateDetailInterface[];
  @Input() isLoading: boolean;
  @Input() initialRateId: string;
  @Input() doSelectRate: Subject<string>;
  @Input() maxDropDownHeight = 300;
  @Input() qaId = 'default';

  @Input() noRateSelectedText: string = null;
  @Input() hasInfoButton = false;
  @Input() selectedExtraDurations: number[];

  @Output() ratesSelectOpened: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() rateSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() infoButtonClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleExtraDuration = new EventEmitter<RateToggleExtraDurationInterface>();

  constructor(
    private trackingService: TrackingService
  ) {}

  onRateClicked(rateId: string): void {
    this.trackingService?.doEmitRateSelected(this.trackFlowId, this.trackPaymentMethod, rateId);
  }
}
