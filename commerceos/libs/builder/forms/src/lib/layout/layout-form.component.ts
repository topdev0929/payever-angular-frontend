import { Component } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebLayout, PebLayoutType, PebSize, PebUnit, SelectOption } from '@pe/builder/core';
import {
  addColumnAuto,
  addRowAuto,
  bboxDimension,
  elementInnerSpace,
  removeColumnAuto,
  removeRowAuto,
} from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-layout-form',
  templateUrl: './layout-form.component.html',
  styleUrls: ['./layout-form.component.scss'],
  providers: [PeDestroyService],
})
export class PebLayoutFormComponent {
  @Select(PebElementsState.selected) private selectedElements$!: Observable<PebElement[]>;

  layoutTypes: SelectOption[] = Object.keys(PebLayoutType).map(key => ({
    name: key,
    value: PebLayoutType[key],
  }));

  form = this.formBuilder.group({
    type: this.formBuilder.control(PebLayoutType.Default),
    columns: this.formBuilder.array([]),
    rows: this.formBuilder.array([]),
  });

  get columns(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }

  showColumns = true;
  showRows = true;
  layoutType = PebLayoutType;
  units = [PebUnit.Pixel, PebUnit.Percent, PebUnit.Auto];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
  ) {
    this.selectedElements$.pipe(
      distinctUntilChanged(([current], [previous]) => current?.id === previous?.id),
      filter(([element]) => !!element),
      tap(([element]) => this.setLayout(element.styles.layout ?? DEFAULT_LAYOUT, { emitEvent: false })),
      switchMap(selected => this.form.valueChanges.pipe(
        tap(() => this.saveLayout(selected)),
      )),
      catchError((err) => {
        console.error(err);

        return of(undefined);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private setLayout(layout: PebLayout, { emitEvent } = { emitEvent: true }) {
    const options = { emitEvent: false };

    this.form.patchValue({ type: layout.type }, options);

    this.columns.clear(options);
    this.rows.clear(options);

    layout.columns.forEach(value => this.columns.push(this.formBuilder.group({ value }), options));
    layout.rows.forEach(value => this.rows.push(this.formBuilder.group({ value }), options));

    if (emitEvent) {
      this.form.updateValueAndValidity();
    }
  }

  getLayout(): PebLayout {
    const model: LayoutFormValueModel = this.form.getRawValue();

    return {
      type: model.type,
      columns: model.columns.map(col => col.value),
      rows: model.rows.map(row => row.value),
    };
  }

  private saveLayout(selected: PebElement[]): void {
    const layout = this.getLayout();

    this.store.dispatch(new PebUpdateAction(selected.map(elm => ({ id: elm.id, styles: { layout } }))));
  }

  addColumn(): void {
    this.setLayout(addColumnAuto(this.getLayout(), PebUnit.Percent, this.selectedMaxSpace));
    this.showColumns = true;
  }

  addRow(): void {
    this.setLayout(addRowAuto(this.getLayout(), PebUnit.Percent, this.selectedMaxSpace));
    this.showRows = true;
  }

  removeColumn(index: number): void {
    this.setLayout(removeColumnAuto(this.getLayout(), index, this.selectedMaxSpace));
  }

  removeRow(index: number): void {
    this.setLayout(removeRowAuto(this.getLayout(), index, this.selectedMaxSpace));
  }

  get selectedMaxSpace(): number {
    const [selected] = this.store.selectSnapshot(PebElementsState.selected);

    return bboxDimension(elementInnerSpace(selected)).width;
  }

}

interface LayoutFormValueModel {
  type: PebLayoutType;
  columns: { value: PebSize }[];
  rows: { value: PebSize }[];
}

const DEFAULT_LAYOUT = {
  type: PebLayoutType.Default,
  columns: [{ value: 100, unit: PebUnit.Percent }],
  rows: [{ value: 100, unit: PebUnit.Percent }],
};
