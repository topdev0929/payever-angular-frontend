import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebVideoFormService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  constructor(private readonly store: Store) {
  }

  setVideo(dirty, value) {
    return this.selectedElements$.pipe(
      map(([element]) => {
        const payload = { id: element.id, data: {} };

        Object.keys(dirty).forEach((key) => {
          if (dirty[key]) {
            payload.data[key] = value[key];
          }
        });

        this.store.dispatch(new PebUpdateAction([payload]));
      }),
    );
  }

}
