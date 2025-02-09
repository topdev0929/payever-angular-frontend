import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentSubmissionService extends Subject<number> implements OnDestroy {

  ngOnDestroy(): void {
    this.complete();
  }

  next(value = Date.now()): void {
    super.next(value);
  }
}
