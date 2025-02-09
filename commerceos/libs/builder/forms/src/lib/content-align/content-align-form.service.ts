import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { PebContentAlign, textJustifyToContentAlignMap } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebContentAlignFormService {
  @Select(PebElementsState.selected) readonly selectedElements$!: Observable<PebElement[]>;

  formValue$ = this.selectedElements$.pipe(
    filter(elements => elements?.length > 0),
    map(([element]) => this.toFormValue(element)),
  )

  constructor(
    private readonly store: Store,
  ) {
  }

  setValue(form: Partial<ContentAlignFormModel>) {
    const elements = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];

    elements.forEach((elm) => {
      payload.push({
        id: elm.id,
        styles: { textStyles: { textJustify: form.contentAlign } },
      });
    });

    this.store.dispatch(new PebUpdateAction(payload));
  }

  toFormValue(elm: PebElement | undefined): ContentAlignFormModel {
    return {
      contentAlign: textJustifyToContentAlignMap[elm.styles.textStyles?.textJustify]
        ?? PebContentAlign.left,
    };
  }
}

export interface ContentAlignFormModel {
  contentAlign: PebContentAlign,
}
