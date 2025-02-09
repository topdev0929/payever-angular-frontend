import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import {
  ErrorInterface, NodePaymentResponseInterface,
} from '@pe/checkout/types';

export interface ErrorDataInterface {
  error: ErrorInterface;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root',
})
export class SantanderSePaymentStateService {
  isReadyForStartSigning$ = new BehaviorSubject(false);
  isCheckStatusProcessing$ = new BehaviorSubject(false);
  isWaitingForSignUrl$ = new BehaviorSubject(false);
  isUpdatePaymentTimeout$ = new BehaviorSubject(false);
  error$ = new Subject<ErrorDataInterface>();

  paymentResponse: NodePaymentResponseInterface<any>;
}
