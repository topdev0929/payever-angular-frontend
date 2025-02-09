import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BusinessInterface } from '@pe/common/micro/types/business';

@Injectable()
export class EnvService {
  private businessUuidStream$ = new BehaviorSubject<string>(null);
  private businessStream$ = new BehaviorSubject<BusinessInterface>(null);
  private countryStream$ = new BehaviorSubject<string>(null);
  private currencyStream$ = new BehaviorSubject<string>(null);

  businessUuid$ = this.businessUuidStream$.asObservable();
  country$ = this.countryStream$.asObservable();
  currency$ = this.currencyStream$.asObservable();

  get businessUuid(): string {
    return this.businessUuidStream$.value;
  }

  set businessUuid(uuid: string) {
    this.businessUuidStream$.next(uuid);
  }

  get country(): string {
    return this.countryStream$.value;
  }

  set country(value: string) {
    this.countryStream$.next(value);
  }

  get currency(): string {
    return this.currencyStream$.value;
  }

  set currency(value: string) {
    this.currencyStream$.next(value);
  }

  get business(): BusinessInterface {
    return this.businessStream$.value;
  }

  set business(business: BusinessInterface) {
    this.businessStream$.next(business);
  }
}
