import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';

import { elementsDefaults } from '@pe/builder/abstract';
import { PebDeleteElementAction, PebGroupAction, PebUngroupAction } from '@pe/builder/actions';
import { PebElementType, PebScreen } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebCreateShapeService } from '@pe/builder/shapes';
import { EditorContextMenuComponent } from '@pe/builder/shared';
import {
  PebElementsState,
  PebInsertAction,
  PebOptionsState,
} from '@pe/builder/state';


export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];


@Injectable({ providedIn: 'any' })
export class PebContextMenuService {

  @Select(PebElementsState.selected) selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;

  private overlayRef: OverlayRef;

  constructor(
    private readonly overlay: Overlay,
    private readonly createShape: PebCreateShapeService,
    private readonly store: Store,
  ) {
  }

  open(x: number, y: number) {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo({ x, y })
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'peb-context-menu',
    });

    this.overlayRef.backdropClick().pipe(
      take(1),
      tap(() => this.overlayRef.dispose()),
    ).subscribe();

    this.selectedElements$.pipe(
      take(1),
      filter(selectedElements => selectedElements.every(el => el.type !== PebElementType.Document)),
      switchMap((selectedElements) => {
        const component = this.overlayRef.attach(new ComponentPortal(EditorContextMenuComponent));

        return component.instance.event.pipe(
          withLatestFrom(this.screen$),
          tap(([value, screen]) => {
            switch (value) {
              case 'addSection':
                this.store.dispatch(new PebInsertAction(
                  [elementsDefaults.section],
                  { selectInserted: true, sync: true },
                ));
                break;
              case 'delete':
                this.store.dispatch(new PebDeleteElementAction());
                break;
              case 'group':
                this.store.dispatch(new PebGroupAction());
                break;
              case 'ungroup':
                this.store.dispatch(new PebUngroupAction());
                break;
              case 'save':
                this.createShape.openCreateDialog(selectedElements);
                break;
            }

            this.overlayRef.dispose();
          }),
        );
      }),
    ).subscribe();
  }

}
