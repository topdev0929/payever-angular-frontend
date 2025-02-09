import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';

import { PebPartialContent, PebRenderElementModel } from '@pe/builder/core';
import { PebViewState } from '@pe/builder/view-state';

import { PebPartialContentService } from '../contracts';

@Injectable()
export class PebDashboardPartialContentService implements PebPartialContentService {
  constructor(
    private readonly store: Store,
  ) {
  }

  loadContent$(partial: PebPartialContent): Observable<PebRenderElementModel | undefined> {
    if (!partial?.elementId) {
      return of(undefined);
    }

    return of(this.store.selectSnapshot(PebViewState.elements)[partial.elementId]);
  }
}
