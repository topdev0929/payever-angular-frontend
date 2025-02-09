import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { PebContentAlign, PebScreen } from '@pe/builder/core';
import { PebOptionsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebContentAlignFormService } from './content-align-form.service';

@Component({
  selector: 'peb-content-align-form',
  templateUrl: './content-align-form.component.html',
  styleUrls: ['./content-align-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebContentAlignForm {
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;

  contentAlignTypes = [
    { value: PebContentAlign.left, name: 'Left' },
    { value: PebContentAlign.canter, name: 'Center' },
    { value: PebContentAlign.right, name: 'Right' },
  ];

  form = this.formBuilder.group({
    contentAlign: this.formBuilder.control(PebContentAlign.left),
  });

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
    private readonly service: PebContentAlignFormService,
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
