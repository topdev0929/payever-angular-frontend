import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * @deprecated - Handle via state selector
 */
@Injectable({
  providedIn: 'root',
})
export class RatesStateService {
  enableDurationsSelectForMerchant$ = new BehaviorSubject<boolean>(false);
}
