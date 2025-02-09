import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { produceWithPatches } from 'immer';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PeAuthService } from '@pe/auth';
import { PebWebsocketAction } from '@pe/builder/actions';
import { PebWebsocketEventType, PebWebsocketService } from '@pe/builder/api';
import {
  PebApplyPatches,
  PebEditorState,
  PebUndoSet,
  PebUndoState,
} from '@pe/builder/state';


@Injectable()
export class PebActionsService implements OnDestroy {

  private readonly destroy$ = new Subject<void>();

  private readonly message$ = this.actions$.pipe(
    ofActionDispatched(PebWebsocketAction),
    map((payload: PebWebsocketAction) => {
      /** Update undo state only if both, patches and inversePatches present in payload */
      if (payload.data.patches && payload.data.inversePatches) {
        const theme = this.store.selectSnapshot(PebEditorState.theme);
        const undoState = this.store.selectSnapshot(PebUndoState);

        if (theme.undo) {
          const index = undoState.items.findIndex(item => item.id === theme.undo);
          const items = [...undoState.items.slice(0, index + 1), { ...payload.data, id: payload.id }];
          const length = undoState.length - undoState.items.length + index + 2;

          this.store.dispatch(new PebUndoSet({
            length,
            index: length - 1,
            offset: 1,
            limit: undoState.limit,
            items,
          }));
        } else {
          this.store.dispatch(new PebUndoSet({
            length: 1,
            index: 0,
            offset: 1,
            limit: undoState.limit,
            items: [{ ...payload.data, id: payload.id }],
          }));
        }

        const base = this.store.selectSnapshot(PebEditorState.state);
        const [, undoPatches] = produceWithPatches(base, (draft) => {
          draft.theme[theme.id].undo = payload.id;
        });

        payload.data.patches.push(...undoPatches);
        this.store.dispatch(new PebApplyPatches(undoPatches));
      }

      const msg: any = {
        event: PebWebsocketEventType.JsonPatch,
        data: {
          id: payload.id,
          token: this.authService.token,
          params: {
            ...payload.data,
            applicationId: this.env.id,
          },
        },
      };

      this.websocketService.send(msg);
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly authService: PeAuthService,
    private readonly store: Store,
    private readonly websocketService: PebWebsocketService,
    private readonly env: PeAppEnv,
  ) {
    this.message$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.websocketService.ngOnDestroy();
  }
}
