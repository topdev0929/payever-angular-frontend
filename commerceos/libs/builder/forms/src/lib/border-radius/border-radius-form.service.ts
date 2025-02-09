import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebElementType } from '@pe/builder/core';
import { bboxDimension } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebBorderRadiusFormService {

  @Select(PebElementsState.selected) selectedElements$!: Observable<PebElement[]>;

  borderRadius$ = this.selectedElements$.pipe(
    map((selected) => {
      const elements = selected.filter((elm) => {
        return elm.type === PebElementType.Shape && elm.parent?.type !== PebElementType.Grid;
      });
      const borderRadius = Math.min(...elements.map(elm => Number(elm.styles.borderRadius ?? 0)));
      const max = Math.min(...elements.map((elm) => {
        const { height, width } = bboxDimension(elm);

        return (height > width ? width : height) / 2;
      }));

      return { borderRadius, max };
    }),
  );

  constructor(private readonly store: Store) {
  }

  updateView(borderRadius: number): void {
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];
    selected.forEach((elm) => {
      payload.push({ id: elm.id, style: { borderRadius: `${borderRadius}px`, overflow: elm.styles.overflow } });
    });
    this.store.dispatch(new PebViewPatchAction(payload));
  }

  updateElements(borderRadius: number): void {
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];
    selected.forEach((elm) => {
      payload.push({ id: elm.id, styles: { borderRadius } });
    });
    this.store.dispatch(new PebUpdateAction(payload));
  }

}
