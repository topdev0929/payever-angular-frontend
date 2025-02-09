import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { isGridLayout } from '@pe/builder/core';
import { PebElement, resolveRowAndColByIndex } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-layout-index-form',
  templateUrl: './layout-index-form.component.html',
  styleUrls: ['./layout-index-form.component.scss'],
  providers: [PeDestroyService],
})
export class PebLayoutIndexFormComponent {
  @Select(PebElementsState.selected) private selectedElements$!: Observable<PebElement[]>;

  selectedIndex?: number | 'auto';
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  indices: number[] = [];
  form = this.fb.group({
    auto: true,
  });

  constructor(
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
    private readonly fb: FormBuilder,
  ) {
    this.selectedElements$.pipe(
      filter(elements => !!elements?.length),
      distinctUntilChanged(([current], [previous]) => current?.id === previous?.id),
      tap(([element]) => {
        this.form.patchValue({ ...element.styles.layoutPosition });
        this.selectedIndex = element.styles.layoutPosition?.index;

        const parent = element.parent;
        this.indices = [];

        if (isGridLayout(parent.styles.layout)) {
          const { rows, columns } = parent.styles.layout;
          this.gridTemplateColumns = `repeat(${columns.length}, 1fr)`;
          this.gridTemplateRows = `repeat(${rows.length}, minmax(15px, 1fr))`;

          for (let row = 0; row < rows.length; row++) {
            for (let col = 0; col < columns.length; col++) {
              this.indices.push(row * columns.length + col);
            }
          }
        }
      }),
      switchMap(() => this.form.valueChanges.pipe(
        tap((val) => {
          const selected = this.store.selectSnapshot(PebElementsState.selected);
          const auto = val.auto;
          const patch = selected.map(elm => ({ id: elm.id, styles: { layoutPosition: { auto } } }));

          this.store.dispatch(new PebUpdateAction(patch));

          this.form.markAsUntouched();
          this.form.markAsPristine();
        }),
        catchError((err) => {
          console.error(err);

          return of();
        })
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  changeIndex(index: number): void {
    const selected = this.store.selectSnapshot(PebElementsState.selected);
    const payload = [];

    selected.forEach((element) => {
      const layout = element.parent.styles.layout ?? { rows: [], columns: [] };
      const { row, column } = resolveRowAndColByIndex(index, layout.rows.length, layout.columns.length);

      payload.push({
        id: element.id,
        styles: {
          layoutPosition: {
            auto: false,
            index,
            row,
            column,
          },
        },
      });
    });

    this.store.dispatch(new PebUpdateAction(payload));
  }
}
