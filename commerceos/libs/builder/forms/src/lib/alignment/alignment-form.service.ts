import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { PebPosition } from '@pe/builder/core';
import { AlignType } from '@pe/builder/old';
import { PebElement, getPebSize } from '@pe/builder/render-utils';
import { PebElementsState, PebSyncAction, PebUpdateAction } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebAlignmentFormService {

  constructor(
    private readonly store: Store,
  ) {
  }

  setAlignment(align: AlignType) {
    const [element] = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);

    const prevPosition = element.styles.position;
    const currPosition = { ...prevPosition, ...this.getNextAlignmentPosition(align) };
    
    const payload = [{ id: element.id, styles: { position: currPosition } }];

    this.store.dispatch(new PebUpdateAction(payload)).pipe(
      tap(() => this.store.dispatch(new PebSyncAction([element], { position: true }))),
    ).subscribe();
  }

  private getNextAlignmentPosition(
    align: AlignType
  ): PebPosition {
    const nextPosition: PebPosition = {};

    if (align === AlignType.Left) {
      nextPosition.left = getPebSize(0);
      nextPosition.right = getPebSize('auto');
      nextPosition.horizontalCenter = undefined;
    }

    if (align === AlignType.Center) {
      nextPosition.left = getPebSize('auto');
      nextPosition.right = getPebSize('auto');
      nextPosition.horizontalCenter = undefined;
    }

    if (align === AlignType.Right) {
      nextPosition.left = getPebSize('auto');
      nextPosition.right = getPebSize(0);
      nextPosition.horizontalCenter = undefined;
    }

    if (align === AlignType.Top) {
      nextPosition.top = getPebSize(0);
      nextPosition.bottom = getPebSize('auto');
    }

    if (align === AlignType.Middle) {
      nextPosition.top = getPebSize('auto');
      nextPosition.bottom = getPebSize('auto');
    }

    if (align === AlignType.Bottom) {
      nextPosition.top = getPebSize('auto');
      nextPosition.bottom = getPebSize(0);
    }

    return nextPosition;
  }

}
