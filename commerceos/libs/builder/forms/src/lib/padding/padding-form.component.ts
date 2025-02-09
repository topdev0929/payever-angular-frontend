import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { PebScreen, PebUnit } from '@pe/builder/core';
import { PebOptionsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebPaddingFormService } from './padding-form.service';

@Component({
  selector: 'peb-padding-form',
  templateUrl: './padding-form.component.html',
  styleUrls: ['./padding-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebPaddingForm {
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;

  form = this.formBuilder.group({
    left: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
    top: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
    right: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
    bottom: this.formBuilder.control({ value: 0, unit: PebUnit.Auto }),
  });

  syncEnabled$ = this.service.syncEnabled$;

  loadValue$ = this.service.formValue$.pipe(
    tap((value) => {
      this.form.patchValue(value, { emitEvent: false });

      this.form.markAsUntouched();
      this.form.markAsPristine();
    }),
  );

  saveValue$ = this.form.valueChanges.pipe(
    tap(value => this.service.setValue(value)),
    takeUntil(this.destroy$),
  );

  constructor(
    private readonly service: PebPaddingFormService,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
    private readonly formBuilder: FormBuilder,
  ) {
    merge(
      this.loadValue$,
      this.saveValue$,
    ).pipe(
      catchError((err, caught) => {
        console.error(err.message);

        return caught;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
