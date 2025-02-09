import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { merge, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PebPublishAction, PebPublishedAction } from '@pe/builder/actions';
import { PebWebsocketEventType, PebWebsocketMessage, PebWebsocketService } from '@pe/builder/api';
import { pebGenerateId } from '@pe/builder/core';


@Injectable()
export class PebPublishingActionHandler implements OnDestroy {

  private destroy$ = new Subject<void>();

  publish$ = this.actions$.pipe(
    ofActionDispatched(PebPublishAction),
    tap((value: PebPublishAction) => {
      const message: PebWebsocketMessage = {
        event: PebWebsocketEventType.Publish,
        data: {
          id: pebGenerateId(),
          token: this.authService.token,
          params: value.payload,
        },
      } as any;

      this.websocketService.send(message);
    }),
  );

  published$ = this.websocketService.messages$.pipe(
    filter(message => !!message.result),
    tap((message) => {
      if (message.name === 'publish') {
        this.store.dispatch(new PebPublishedAction(message));
      }
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly authService: PeAuthService,
    private readonly store: Store,
    private readonly websocketService: PebWebsocketService,
  ) {
    merge(
      this.publish$,
      this.published$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
