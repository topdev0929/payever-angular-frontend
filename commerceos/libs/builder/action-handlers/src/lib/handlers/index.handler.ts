import { Injectable, OnDestroy } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable, Subject, merge } from 'rxjs';
import { catchError, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { setIndexWithPatches } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import {
  PebBringFrontAction,
  PebElementsState,
  PebSendBackAction,
  PebUpdateAction,
} from '@pe/builder/state';

@Injectable()
export class PebIndexActionHandler implements OnDestroy {
  @Select(PebElementsState.selected) selected$!: Observable<PebElement[]>;

  private bringFront$ = this.actions$.pipe(
    ofActionDispatched(PebBringFrontAction),
    withLatestFrom(this.selected$),
    tap(([, selected]) => this.bringFront(selected)),
  );

  private sendBack$ = this.actions$.pipe(
    ofActionDispatched(PebSendBackAction),
    withLatestFrom(this.selected$),
    tap(([, selected]) => this.sendToBack(selected)),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {
    merge(this.bringFront$, this.sendBack$)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err, caught) => {
          console.error(err);

          return caught;
        }),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private bringFront(selected: PebElement[]) {
    const elementsByParent = this.getElementsByParent(selected);

    for (const [parent, elements] of elementsByParent) {
      const index = parent.children?.findIndex(child => !child.master) ?? 0;
      this.moveElements(parent, elements, index);
    }
  }

  private sendToBack(selected: PebElement[]) {
    const elementsByParent = this.getElementsByParent(selected);

    for (const [parent, elements] of elementsByParent) {
      const index = [...parent?.children ?? []].reverse().findIndex(child => !child.master);
      this.moveElements(parent, elements, parent.children.length - index - 1);
    }
  }

  private moveElements(parent: PebElement, elements: PebElement[], index: number) {
    if (parent?.children?.length > 1) {
      elements.forEach((elm) => {
        const currentIndex = parent.children.findIndex(child => child.id === elm.id);
        const patches = setIndexWithPatches(parent.children, currentIndex, index);
        this.store.dispatch(new PebUpdateAction(patches));
      });
    }
  }

  private getElementsByParent(elements: PebElement[]): Map<PebElement, PebElement[]> {
    const map = new Map<PebElement, PebElement[]>();

    for (const element of elements) {
      const parent = element.parent;
      if (!map.has(parent)) {
        map.set(parent, []);
      }

      map.get(parent).push(element);
    }

    return map;
  }
}
