import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { isPixelSize, isStickyPosition, PebPosition, PebScreen } from '@pe/builder/core';
import {
  convertedSize,
  containerMaxSpace,
  isSyncEnabled,
  relativeBBoxSizes,
} from '@pe/builder/editor-utils';
import { getPebSize, isSection, PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebOptionsState, PebSyncAction, PebUpdateAction } from '@pe/builder/state';

@Injectable({ providedIn: 'any' })
export class PebPositionFormService {
  @Select(PebElementsState.selected) readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;

  syncEnabled$: Observable<boolean> = this.selectedElements$.pipe(
    withLatestFrom(this.screen$),
    map(([[element], screen]) => isSyncEnabled(element, screen?.key)),
  );

  constructor(
    private readonly store: Store,
  ) {
  }

  setPosition(position: PebPosition) {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];

    elements.forEach((elm) => {
      const containerBBox = containerMaxSpace(elm);
      const { left, right, top, bottom, parentHeight, parentWidth } = relativeBBoxSizes(containerBBox, elm);

      let horizontalCenter = { ...position.horizontalCenter };
      if (isPixelSize(horizontalCenter)) {
        horizontalCenter = getPebSize(left - parentWidth / 2);
      }

      const convertSizes = !isStickyPosition(position) && !isSection(elm);

      payload.push({
        id: elm.id,
        styles: {
          position: {
            ...position,
            left: convertSizes
              ? convertedSize(elm.styles.position.left, position.left, parentWidth, left)
              : position.left,
            top: convertSizes
              ? convertedSize(elm.styles.position.top, position.top, parentHeight, top)
              : position.top,
            right: convertSizes
              ? convertedSize(elm.styles.position.right, position.right, parentWidth, right)
              : position.right,
            bottom: convertSizes
              ? convertedSize(elm.styles.position.bottom, position.bottom, parentHeight, bottom)
              : position.bottom,
            horizontalCenter,
          },
        },
      });
    });

    this.store.dispatch(new PebUpdateAction(payload)).pipe(
      tap(() => this.store.dispatch(new PebSyncAction(elements, { position: true }))),
    ).subscribe();
  }
}
