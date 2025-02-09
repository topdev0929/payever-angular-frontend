import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { EMPTY, merge, Observable, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  expand,
  filter,
  first,
  map,
  reduce,
  share,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PeAuthService } from '@pe/auth';
import { PebLoadUndoAction } from '@pe/builder/actions';
import { PebWebsocketEventType, PebWebsocketService } from '@pe/builder/api';
import { pebGenerateId, PebTheme } from '@pe/builder/core';
import {
  defaultUndoState,
  PebEditorState,
  PebUndoPrepend,
  PebUndoResponse,
  PebUndoSet,
  PebUndoStateModel,
} from '@pe/builder/state';


@Injectable()
export class PebUndoActionHandler implements OnDestroy {

  @Select(PebEditorState.theme) private readonly theme$!: Observable<PebTheme>;

  private readonly destroy$ = new Subject<void>();

  private readonly initTheme$ = this.theme$.pipe(
    filter(theme => !!theme),
    distinctUntilChanged((a, b) => a.id === b.id),
    map(() => new PebLoadUndoAction(0, defaultUndoState.limit)),
  );

  private readonly loadUndoAction$ = this.actions$.pipe(
    ofActionDispatched(PebLoadUndoAction)
  );

  private readonly command$ = merge(this.initTheme$, this.loadUndoAction$).pipe(
    distinctUntilChanged((a, b) => a.offset === b.offset),
    map((value: PebLoadUndoAction) => {
      const { offset, limit } = value;
      const page = Math.floor(offset / limit) + 1;
      const themeId = this.store.selectSnapshot(PebEditorState.themeId);

      return {
        event: PebWebsocketEventType.LoadUndoList,
        data: {
          id: pebGenerateId(),
          token: this.authService.token,
          params: {
            applicationId: this.env.id,
            themeId,
            pagination: { page, limit },
          },
        },
      };
    }),
  );

  private readonly query$: Observable<PebUndoResponse> = this.websocketService.messages$.pipe(
    filter((msg: any) => msg.name === PebWebsocketEventType.LoadUndoList),
    distinctUntilChanged((a, b) => a.id === b.id),
    share(),
  );

  private readonly initial$ = this.query$.pipe(
    first(),
    expand((value) => {
      const theme = this.store.selectSnapshot(PebEditorState.theme);
      if (
        theme.undo
        && !value.data.histories.find(item => item.id === theme.undo)
        && value.data.pagination.page * value.data.pagination.limit < value.data.pagination.total
      ) {
        this.store.dispatch(new PebLoadUndoAction(
          value.data.pagination.page * value.data.pagination.limit,
          value.data.pagination.limit
        ));

        return this.query$.pipe(
          take(1),
        );
      }

      return EMPTY;
    }, 0),
    reduce((acc, value) => {
      const items = value.data.histories.reverse().map((item) => {
        return {
          id: item.id,
          patches: item.patches,
          inversePatches: item.reverses,
        };
      });

      return {
        length: value.data.pagination.total,
        index: value.data.pagination.total - 1,
        offset: acc.offset + items.length,
        limit: value.data.pagination.limit,
        items: items.concat(acc.items),
      } as PebUndoStateModel;

    }, defaultUndoState),
    tap((value) => {
      const theme = this.store.selectSnapshot(PebEditorState.theme);
      if (theme.undo) {
        const index = value.items.findIndex(item => item.id === theme.undo);
        if (index !== -1) {
          value.index = value.length - value.items.length + index;
        }
      }

      this.store.dispatch(new PebUndoSet(value));
    }),
    share(),
  );

  chunk$ = this.initial$.pipe(
    switchMap(() => this.query$),
    map(value =>  value.data.histories.reverse().map((item) => {
      return {
        id: item.id,
        patches: item.patches,
        inversePatches: item.reverses,
      };
    })),
    tap((value) => {
      this.store.dispatch(new PebUndoPrepend(value));
    })
  );

  constructor(
    private readonly actions$: Actions,
    private readonly authService: PeAuthService,
    private readonly store: Store,
    private readonly websocketService: PebWebsocketService,
    private readonly env: PeAppEnv,
  ) {
    merge(
      this.initTheme$,
      this.chunk$,
      this.command$.pipe(
        tap((message) => {
          this.websocketService.send(message as any);
        }),
      )
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
