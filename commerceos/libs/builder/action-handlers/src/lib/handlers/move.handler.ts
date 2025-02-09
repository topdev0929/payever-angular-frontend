import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { catchError, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebControlsService } from '@pe/builder/controls';
import { editorMappedStyles, getFilteredLinkedList, moveELement } from '@pe/builder/editor-utils';
import { PebElement, PebLinkedList, deserializeLinkedList, isMasterElement, serializeLinkedList } from '@pe/builder/render-utils';
import { PebRevertViewPatchAction, PebViewPatchAction } from '@pe/builder/renderer';
import {
  PebElementsState,
  PebMoveAction,
  PebUpdateAction,
  PebSelectAction,
  PebSyncAction,
} from '@pe/builder/state';


@Injectable()
export class PebMoveActionHandler implements OnDestroy {

  @Select(PebElementsState.selected) private readonly selected$!: Observable<PebElement[]>;
  @Select(PebElementsState.visibleElements) private readonly models$!: Observable<PebElement[]>;

  private move$ = this.actions$.pipe(
    ofActionDispatched(PebMoveAction),
    withLatestFrom(this.selected$),
    tap(([action, selected]: [PebMoveAction, PebElement[]]) => {
      const { elements, parent, translate, dropPoint } = action;

      const movePayload = [];
      const newChildren = new Map<string, PebLinkedList<PebElement>>();

      elements.forEach((element) => {
        const siblings = newChildren.get(element.parent.id) ?? this.getChildren(element.parent?.children);
        const newParentChildren = newChildren.get(parent.id) ?? this.getChildren(parent?.children);

        movePayload.push(...moveELement(element, parent, translate, siblings, newParentChildren, dropPoint).elementUpdates);

        newChildren.set(element.parent.id, siblings);
        newChildren.set(parent.id, newParentChildren);
      });

      this.store.dispatch(new PebUpdateAction(movePayload)).pipe(
        switchMap(() => this.models$),
        tap((models) => {
          const elementIds = elements.map(elm => elm.id);
          const newElements = models.filter(elm => elementIds.includes(elm.id));
          this.store.dispatch(new PebSyncAction(newElements, { position: true }));
        }),
        take(1),
      ).subscribe();
    }),
  );

  private revert$ = this.actions$.pipe(
    ofActionDispatched(PebRevertViewPatchAction),
    withLatestFrom(this.selected$),
    tap(([action, selected]: [PebRevertViewPatchAction, PebElement[]]) => {
      this.revertPosition(action.elements, selected);
    }),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly controlsService: PebControlsService,

  ) {
    merge(this.move$, this.revert$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  private getChildren(children?: PebLinkedList<PebElement>): PebLinkedList<PebElement> {
    return getFilteredLinkedList(
      deserializeLinkedList(serializeLinkedList(children ?? new PebLinkedList<PebElement>())),
      elm => !isMasterElement(elm),
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private revertPosition(elements: PebElement[], selected: PebElement[]): void {
    const payload = [];
    elements.forEach((element) => {
      payload.push({
        id: element.id,
        style: editorMappedStyles(element),
      });
    });

    this.store.dispatch(new PebViewPatchAction(payload));

    const controls = this.controlsService.createDefaultControlsSet(elements);
    this.controlsService.renderControls(controls);

    this.store.dispatch(new PebSelectAction(selected));
  }
}
