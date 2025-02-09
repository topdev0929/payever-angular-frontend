import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, fromEvent, merge } from 'rxjs';
import { catchError, filter, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebDeleteElementAction, PebRedoAction, PebUndoAction } from '@pe/builder/actions';
import { PebEventsService } from '@pe/builder/events';
import { PebCopyElementsAction, PebEditorState, PebEditTextModel, PebPasteElementsAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';


@Injectable()
export class PebKeyboardHandler {
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  keyHandlers: KeyboardHandler[] = [
    {
      filter: ev => metaOrCtrl(ev) && ev.code === 'KeyC',
      handle: () => this.store.dispatch(new PebCopyElementsAction()),
    },
    {
      filter: ev => metaOrCtrl(ev) && ev.code === 'KeyV',
      handle: () => this.store.dispatch(new PebPasteElementsAction()),
    },
    {
      filter: ev => metaOrCtrl(ev) && !ev.shiftKey && ev.code === 'KeyZ',
      handle: () => this.store.dispatch(new PebUndoAction()),
    },
    {
      filter: ev => metaOrCtrl(ev) && ev.shiftKey && ev.code === 'KeyZ',
      handle: () => this.store.dispatch(new PebRedoAction()),
    },
    {
      filter: ev => ev.key === 'Backspace' || ev.key === 'Delete',
      handle: () => this.store.dispatch(new PebDeleteElementAction()),
    },
  ];

  windowKeydown$ = fromEvent(window, 'keydown').pipe(
    filter((event): event is KeyboardEvent => !(event.target instanceof HTMLInputElement)),
  );

  handleKeydown$ = merge(this.windowKeydown$, this.eventsService.keydown$).pipe(
    withLatestFrom(this.editText$),
    filter(([, editText]) => !editText.enabled),
    map(([event]) => event as KeyboardEvent),
    tap((ev) => {
      const handler = this.keyHandlers.find(handler => handler.filter(ev));
      handler && handler.handle();
    }),
  );


  constructor(
    private readonly eventsService: PebEventsService,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
  ) {
    merge(this.handleKeydown$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }
}

const metaOrCtrl = (ev: KeyboardEvent) => ev.metaKey || ev.ctrlKey;

interface KeyboardHandler {
  filter: (ev: KeyboardEvent) => boolean,
  handle: () => void,
};
