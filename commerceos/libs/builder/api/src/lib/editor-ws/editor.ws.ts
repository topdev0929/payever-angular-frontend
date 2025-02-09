import { Injectable, OnDestroy } from '@angular/core';
import { combineLatest, interval, Observable, Subject } from 'rxjs';
import { delay, filter, retryWhen, share, takeUntil, tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';

import { PeAppEnv } from '@pe/app-env';

import { PebErrorMessage, PebWebsocketMessage, PebWebsocketResponseMessage } from './editor.ws.constants';

@Injectable()
export class PebWebsocketService implements OnDestroy {

  private readonly reconnectDelay = 2000;
  private readonly pingInterval = 30000;
  private readonly destroy$ = new Subject<void>();
  private readonly webSocket$ = webSocket<any>({ url: this.env.ws });

  tokenInvalid$ = this.webSocket$.pipe(
    filter(msg => msg.error 
      && msg.error === PebErrorMessage.tokenInvalid
      ),
    takeUntil(this.destroy$),
    share(),
    );

    readonly sessionExpired$ = combineLatest([
      this.tokenInvalid$,
    ]).pipe(
      takeUntil(this.destroy$),
    );

  readonly messages$: Observable<PebWebsocketResponseMessage> = this.webSocket$.pipe(
    retryWhen(errors => errors.pipe(delay(this.reconnectDelay))),
    takeUntil(this.destroy$),
    share(),
  );

  constructor(private readonly env: PeAppEnv) {
    this.messages$.subscribe();

    interval(this.pingInterval)
      .pipe(
        tap(() => this.webSocket$.next('ping')),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  send(event: PebWebsocketMessage): void {
    this.webSocket$.next(event);
  }

  ngOnDestroy() {
    this.webSocket$.complete();
    this.destroy$.next();
  }
}
