import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebDimension, PebUnit } from '@pe/builder/core';
import { PeDestroyService } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';

import { PebDimensionsFormService } from './dimensions-form.service';

@Component({
  selector: 'peb-dimensions-form',
  templateUrl: './dimensions-form.component.html',
  styleUrls: ['./dimensions-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebDimensionsForm {

  form = this.formBuilder.group({
    height: { value: 0, unit: PebUnit.Auto },
    width: { value: 0, unit: PebUnit.Auto },
    minHeight: { value: 0, unit: PebUnit.Auto },
    minWidth: { value: 0, unit: PebUnit.Auto },
    constrainProportions: false,
  });

  syncEnabled$ = this.dimensionsFormService.syncEnabled$;
  canEditHeight$ = this.dimensionsFormService.canEditHeight$;

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly dimensionsFormService: PebDimensionsFormService,
    private readonly formBuilder: FormBuilder,
    private readonly snackbarService: SnackbarService,
  ) {
    this.dimensionsFormService.dimensions$.pipe(
      tap((value) => {
        this.patchFormValue(value);
      }),
      switchMap(dimensions => this.form.valueChanges.pipe(
        tap((value) => {
          if (this.isDirty('minWidth') || this.isDirty('minHeight')) {
            this.dimensionsFormService.updateDimension({
              minWidth: value.minWidth,
              minHeight: value.minHeight,
            });
          }

          const valid = this.dimensionsFormService.apply(
            this.getDirtyDimension(),
            this.isDirty('constrainProportions') ? this.form.value.constrainProportions : undefined,
          );

          if (!valid) {
            this.snackbarService.toggle(true, {
              content: 'Invalid dimension',
              duration: 2000,
              iconId: 'icon-commerceos-error',
            });

            this.patchFormValue(dimensions);
          }

          this.form.markAsUntouched();
          this.form.markAsPristine();
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  patchFormValue(value) {
    this.form.patchValue(value, { emitEvent: false });
  }

  private getDirtyDimension(): PebDimension | undefined {
    return this.isDirty('width') || this.isDirty('height')
      ? {
        width: this.form.value.width,
        height: this.form.value.height,
      }
      : undefined;
  }

  private isDirty(field: string): boolean {
    return this.form.get(field).dirty;
  }
}
