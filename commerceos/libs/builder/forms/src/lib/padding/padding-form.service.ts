import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';

import { PebPadding, PebScreen, PebSize } from '@pe/builder/core';
import { PEB_DEFAULT_PADDING, calculatePebSizeToPixel, isSyncEnabled } from '@pe/builder/editor-utils';
import { PebElement, getPebSize } from '@pe/builder/render-utils';
import { PebElementsState, PebOptionsState, PebSyncAction, PebUpdateAction } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebPaddingFormService {
  @Select(PebElementsState.selected) readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;

  syncEnabled$: Observable<boolean> = this.selectedElements$.pipe(
    withLatestFrom(this.screen$),
    map(([[element], screen]) => isSyncEnabled(element, screen?.key)),
  );

  formValue$ = this.selectedElements$.pipe(
    filter(elements => elements?.length > 0),
    map(([element]) => this.toFormValue(element.styles?.padding)),
  )

  constructor(
    private readonly store: Store,
  ) {
  }

  setValue(padding: Partial<PebPadding>) {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];

    const [top, right, bottom, left] =
      calculatePebSizeToPixel([padding.top, padding.right, padding.bottom, padding.left], 0);

    elements.forEach((elm) => {
      payload.push({
        id: elm.id,
        styles: { padding: { left, right, top, bottom } },
      });
    });

    this.store.dispatch(new PebUpdateAction(payload)).pipe(
      tap(() => this.store.dispatch(new PebSyncAction(elements, { padding: true }))),
    ).subscribe();
  }

  toFormValue(padding: PebPadding | undefined): PaddingFormModel {
    if (!padding) {
      padding = PEB_DEFAULT_PADDING;
    }

    return {
      top: getPebSize(padding.top ?? 0),
      right: getPebSize(padding.right ?? 0),
      bottom: getPebSize(padding.bottom ?? 0),
      left: getPebSize(padding.left ?? 0),
    };
  }
}

export interface PaddingFormModel {
  top: PebSize;
  right: PebSize;
  bottom: PebSize;
  left: PebSize;
}