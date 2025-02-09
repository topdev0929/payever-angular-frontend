import { Injectable } from '@angular/core';

import { FlowExtraDurationType } from '@pe/checkout/types';

@Injectable()
export class RateUtilsService<RateInterface> {
  ratesFilter(rates: RateInterface[], property: keyof RateInterface, duration: FlowExtraDurationType): RateInterface[] {
    if (typeof duration == 'number') {
      return rates.filter(rate => rate[property] == duration);
    }

    if (Array.isArray(duration)) {
      return rates.filter(rate => duration.includes(rate[property] as number));
    }

    return rates;
  }
}
