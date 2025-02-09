import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { PaymentSecurityCode, VerifyPayloadInterface } from '../../../../shared';

@Injectable()
export class VerifyService {
  private fieldSubject: Subject<PaymentSecurityCode> = new BehaviorSubject<PaymentSecurityCode>(null);
  private verificationsSubject: Subject<void> = new Subject<void>();
  private doneSubject: Subject<VerifyPayloadInterface> = new Subject<VerifyPayloadInterface>();
  private errorKeySubject: Subject<string> = new Subject<string>();

  get field$(): Observable<PaymentSecurityCode> {
    return this.fieldSubject.asObservable().pipe(filter(field => !!field));
  }

  setField(data: PaymentSecurityCode) {
    this.fieldSubject.next(data);
  }

  get verifications$(): Observable<void> {
    return this.verificationsSubject.asObservable();
  }

  startVerification() {
    this.verificationsSubject.next();
  }

  get done$(): Observable<VerifyPayloadInterface> {
    return this.doneSubject.asObservable();
  }

  done(data: VerifyPayloadInterface) {
    this.doneSubject.next(data);
  }

  get errorKey$(): Observable<string> {
    return this.errorKeySubject.asObservable();
  }

  emitErrorKey(key: string) {
    this.errorKeySubject.next(key);
  }
}
