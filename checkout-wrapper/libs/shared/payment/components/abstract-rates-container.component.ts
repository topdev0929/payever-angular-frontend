import { PercentPipe } from '@angular/common';
import { ChangeDetectorRef, Directive, Injector } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { RateToggleExtraDurationInterface } from '@pe/checkout/rates';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { ParamsState } from '@pe/checkout/store';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

@Directive()
export abstract class AbstractRatesContainerComponent {

  @SelectSnapshot(ParamsState.merchantMode) public merchantMode: boolean;

  @SelectSnapshot(ParamsState.embeddedMode) public embeddedMode: boolean;

  selectedExtraDurations: number[] = [];

  abstract flowId: string;

  protected percentPipe = this.injector.get(PercentPipe);
  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected storage = this.injector.get(PaymentInquiryStorage);
  protected cdr = this.injector.get(ChangeDetectorRef);
  protected destroy$ = this.injector.get(PeDestroyService);

  constructor(protected injector: Injector) {}

  toggleRatesInStorage({ duration, checked }: RateToggleExtraDurationInterface) {
    this.selectedExtraDurations = this.storage.getExtraDurations(this.flowId);

    this.selectedExtraDurations = checked
      ? [...this.selectedExtraDurations, duration]
      : this.selectedExtraDurations.filter(id => id !== duration);

    this.storage.setExtraDurations(this.flowId, this.selectedExtraDurations);
  }

}
