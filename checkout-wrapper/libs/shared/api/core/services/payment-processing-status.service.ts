import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

enum StatusChangeEnum {
  processingStarted = 'payeverCheckoutPaymentProcessingStarted',
  processingFinished = 'payeverCheckoutPaymentProcessingFinished',
  statusCheckStarted = 'payeverCheckoutPaymentStatusCheckStarted',
  statusCheckFinished = 'payeverCheckoutPaymentStatusCheckFinished'
}

@Injectable()
export class PaymentProcessingStatusService implements OnDestroy {

  private events$ = new BehaviorSubject<StatusChangeEnum>(null);
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(
  ) {
    fromEvent<MessageEvent>(window, 'message').pipe(takeUntil(this.destroyed$)).subscribe((message: MessageEvent) => {
      if (Object.values(StatusChangeEnum).indexOf(message.data.event) >= 0) {
        this.events$.next(message.data.event);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get locked$(): Observable<boolean> {
    return this.events$.pipe(
      map(e => [StatusChangeEnum.statusCheckStarted, StatusChangeEnum.processingStarted].indexOf(e) >= 0)
    );
  }

  emitProcessingStarted(): void {
    this.emit(StatusChangeEnum.processingStarted);
  }

  emitProcessingFinished(): void {
    this.emit(StatusChangeEnum.processingFinished);
  }

  emitCheckStatusStarted(): void {
    this.emit(StatusChangeEnum.statusCheckStarted);
  }

  emitCheckStatusFinished(): void {
    this.emit(StatusChangeEnum.statusCheckFinished);
  }

  private emit(event: StatusChangeEnum): void {
    window.postMessage(
      {
        event,
      },
      '*'
    );
  }
}
