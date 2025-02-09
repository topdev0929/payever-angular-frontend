import { Injectable } from '@angular/core';
import { Action, Actions, ofActionCompleted, ofActionDispatched, State, StateContext, Store } from '@ngxs/store';
import { animationFrameScheduler, ReplaySubject } from 'rxjs';
import { map, switchMap, take, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { PebLoadUndoAction, PebRedoAction, PebResetUndoAction, PebUndoAction } from '@pe/builder/actions';

import { PebApplyUndo } from '../editor';
import { PebElementsState, PebSelectAction } from '../elements';

import { defaultUndoState, PebUndoStateModel } from './undo';
import { PebUndoAppend, PebUndoPrepend, PebUndoSet } from './undo.actions';


@State<PebUndoStateModel>({
  name: 'undo',
  defaults: defaultUndoState,
})
@Injectable()
export class PebUndoState {

  reselect$ = new ReplaySubject<any>(1);

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {
    this.reselect$.pipe(
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      map((patches) => {
        return patches.reduce((acc, patch) => {
          if (patch.path[4] === 'element') {
            const deleted = patch.op === 'add' && patch.path[6] === 'deleted';
            const versionChanged = patch.path[6] === 'data' && patch.path[7] === 'version';
            if (!deleted && !versionChanged && !['prev', 'next', 'versionNumber'].includes(patch.path[6] as string)) {
              acc.add(patch.path[5] as string);
            }
          }

          return acc;
        }, new Set<string>());
      }),
      switchMap((elements: Set<string>) => this.store.select(PebElementsState.visibleElements).pipe(
        tap((models) => {
          const selected = models.filter(m => elements.has(m.id));
          this.store.dispatch(new PebSelectAction([...selected.values()]));
        }),
        take(1),
      )),
    ).subscribe();
  }

  @Action(PebUndoSet)
  set(ctx: StateContext<PebUndoStateModel>, { payload }: PebUndoSet) {
    ctx.setState(payload);
  }

  @Action(PebUndoPrepend)
  prepend(ctx: StateContext<PebUndoStateModel>, payload: PebUndoPrepend) {
    const { items, offset } = ctx.getState();
    ctx.patchState({
      items: [...payload.items, ...items],
      offset: offset + payload.items.length,
    });
  }

  @Action(PebUndoAppend)
  append(ctx: StateContext<PebUndoStateModel>, payload: PebUndoAppend) {
    const { items, length, index } = ctx.getState();
    ctx.patchState({
      items: [...items, ...payload.items],
      length: length + payload.items.length,
      index: index + payload.items.length,
    });
  }

  @Action(PebUndoAction)
  undo(ctx: StateContext<PebUndoStateModel>) {
    const state = ctx.getState();
    const index = Math.max(state.index, -1);
    const nextIndex = Math.max(state.index - 1, -1);

    if (index !== -1 && index < state.length - state.items.length) {
      ctx.dispatch(new PebLoadUndoAction(state.offset, state.limit));

      return this.actions$.pipe(
        ofActionCompleted(PebUndoPrepend),
        take(1),
        tap(() => {
          const st = ctx.getState();
          const pointer = st.index - (st.length - st.items.length);
          const undo = st.items[pointer];
          const id = st.items[pointer - 1]?.id ?? null;

          ctx.patchState({ index: nextIndex });

          this.reselect$.next(undo.inversePatches);
          this.store.dispatch(new PebApplyUndo(id, undo.inversePatches));
        }),
        takeUntil(this.actions$.pipe(ofActionDispatched(PebRedoAction))),
      );
    }

    ctx.patchState({ index: nextIndex });

    if (index !== -1) {
      const pointer = state.index - (state.length - state.items.length);
      const undo = state.items[pointer];
      const id = state.items[pointer - 1]?.id ?? null;

      this.reselect$.next(undo.inversePatches);
      this.store.dispatch(new PebApplyUndo(id, undo.inversePatches));
    }
  }

  @Action(PebRedoAction)
  redo(ctx: StateContext<PebUndoStateModel>) {
    const state = ctx.getState();
    const index = Math.min(state.index + 1, state.length - 1);

    ctx.patchState({ index });

    const pointer = index - (state.length - state.items.length);
    const redo = state.items[pointer];
    const id = state.items[pointer].id;

    this.reselect$.next(redo.patches);
    this.store.dispatch(new PebApplyUndo(id, redo.patches));
  }

  @Action(PebResetUndoAction)
  reset(ctx: StateContext<PebUndoStateModel>) {
    ctx.setState(defaultUndoState);
  }
}
