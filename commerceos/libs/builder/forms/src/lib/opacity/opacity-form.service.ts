import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';

@Injectable({ providedIn: 'any' })
export class PebOpacityFormService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  opacity$ = this.selectedElements$.pipe(
    map((elements) => {
      return Math.min(...elements.map(elm => (elm.styles.opacity ?? 1) * 100));
    })
  );

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
  ) {
  }

  updateView(opacity: number) {
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];
    selected.forEach((elm) => {
      payload.push({ id: elm.id, style: { opacity } });
    });
    this.store.dispatch(new PebViewPatchAction(payload));
  }

  updateElements(opacity: number) {
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];
    selected.forEach((elm) => {
      payload.push({ id: elm.id, styles: { opacity } });
    });
    this.store.dispatch(new PebUpdateAction(payload));
  }
}
