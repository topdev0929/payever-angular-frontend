import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, HostBinding } from '@angular/core';

import { TimestampEvent } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-sdk-rates-container',
  templateUrl: './rates-container.component.html',
  styleUrls: ['./rates-container.component.scss'],
})
export class RatesContainerComponent {

  @Input() isLoading: boolean;
  @Input() loadErrorMessage: string;
  @Input() noRatesText: string;
  // Rates interface matters only in app. Here any[] is enough
  @Input() rates: any[];
  @Output() refetch: EventEmitter<TimestampEvent> = new EventEmitter();

  @HostBinding('class.empty') get isEmpty() {
    return !this.loadErrorMessage && !this.isLoading && !this.rates?.length;
  }

  translations = {
    noRates: $localize `:@@checkout_sdk.error.no_rates:`,
  };

  onFetchRates(): void {
    this.refetch.emit(new TimestampEvent());
  }
}
